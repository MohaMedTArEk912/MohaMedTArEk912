/* oxlint-disable react/only-export-components */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// 1. CUSTOM GLSL PULP COMIC SHADER (Cel-Bands + Ink Cross-Hatching + Gold Rim)
// ============================================================================
export const pulpVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  #include <common>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>

  void main() {
    #ifdef USE_UV
      vUv = uv;
    #else
      vUv = vec2(0.0);
    #endif

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    vNormal = normalize(normalMatrix * objectNormal);

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>

    vViewPosition = -mvPosition.xyz;
    vec4 worldPos = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      worldPos = instanceMatrix * worldPos;
    #endif
    vWorldPosition = (modelMatrix * worldPos).xyz;
  }
`;

export const pulpFragmentShader = /* glsl */ `
  uniform vec3 uHighlightColor;
  uniform vec3 uMidtoneColor;
  uniform vec3 uShadowColor;
  uniform vec3 uInkColor;
  uniform vec3 uRimColor;
  uniform vec3 uLightDir;
  uniform float uHatchDensity;
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uMapBlend;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(uLightDir);

    // Lambertian diffuse intensity
    float ndl = dot(normal, lightDir);

    // Screen-space procedural diagonal cross-hatching for comic ink texture
    vec2 screenPos = gl_FragCoord.xy * uHatchDensity;
    float hatch1 = step(0.5, fract((screenPos.x + screenPos.y) * 0.12));
    float hatch2 = step(0.5, fract((screenPos.x - screenPos.y) * 0.12));

    // Optional base texture modulation so facial hair / suit lapel details remain sharp
    vec3 hiCol = uHighlightColor;
    vec3 midCol = uMidtoneColor;
    vec3 shCol = uShadowColor;

    if (uHasMap > 0.5) {
      vec4 texel = texture2D(uMap, vUv);
      vec3 texTint = texel.rgb;
      hiCol = mix(uHighlightColor, texTint * uHighlightColor * 1.45, uMapBlend);
      midCol = mix(uMidtoneColor, texTint * uMidtoneColor * 1.35, uMapBlend);
      shCol = mix(uShadowColor, texTint * uShadowColor * 1.25, uMapBlend);
    }

    // 4-Band Quantized Pulp Comic Shading
    vec3 finalColor = hiCol;

    if (ndl < 0.55) {
      finalColor = midCol;
    }
    if (ndl < 0.20) {
      // Mid-shadow with single diagonal ink hatching
      finalColor = mix(shCol, midCol, hatch1 * 0.35);
    }
    if (ndl < -0.15) {
      // Deep crushed India ink shadow with cross-hatching
      finalColor = mix(uInkColor, shCol, (hatch1 * hatch2) * 0.25);
    }

    // Sulfur-Gold Comic Rim Lighting (Fresnel)
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    float rimBand = smoothstep(0.68, 0.74, rim);
    finalColor = mix(finalColor, uRimColor, rimBand * 0.9);

    // Inner contour ink darkening on grazing angles
    float contourInk = smoothstep(0.84, 0.89, rim);
    finalColor = mix(finalColor, uInkColor, contourInk);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export interface PulpMaterialOptions {
  isSkin?: boolean;
  highlightColor?: string;
  midtoneColor?: string;
  shadowColor?: string;
  inkColor?: string;
  rimColor?: string;
  hatchDensity?: number;
  map?: THREE.Texture | null;
  mapBlend?: number;
}

export function createPulpMaterial({
  isSkin = false,
  highlightColor,
  midtoneColor,
  shadowColor,
  inkColor = '#09080D',
  rimColor = '#F2C94C',
  hatchDensity = 1.15,
  map = null,
  mapBlend = 0.55,
}: PulpMaterialOptions = {}): THREE.ShaderMaterial {
  const mat = new THREE.ShaderMaterial({
    vertexShader: pulpVertexShader,
    fragmentShader: pulpFragmentShader,
    defines: {
      USE_UV: '',
    },
    uniforms: {
      uHighlightColor: {
        value: new THREE.Color(highlightColor ?? (isSkin ? '#F3C6A8' : '#7E5EC2')),
      },
      uMidtoneColor: {
        value: new THREE.Color(midtoneColor ?? (isSkin ? '#DF9A78' : '#5B3E96')),
      },
      uShadowColor: {
        value: new THREE.Color(shadowColor ?? (isSkin ? '#8C4A32' : '#2A194D')),
      },
      uInkColor: { value: new THREE.Color(inkColor) },
      uRimColor: { value: new THREE.Color(rimColor) },
      uLightDir: { value: new THREE.Vector3(0.6, 0.8, 0.7) },
      uHatchDensity: { value: hatchDensity },
      uMap: { value: map },
      uHasMap: { value: map ? 1.0 : 0.0 },
      uMapBlend: { value: mapBlend },
    },
  });
  return mat;
}

// ============================================================================
// 2. AVATAR MESH CONVERTER (Applies Pulp Shader + Inverted Hull Ink Outline)
// ============================================================================
export function applyPulpComicStyleToAvatar(avatarScene: THREE.Object3D): void {
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#09080D'),
    side: THREE.BackSide,
  });

  const meshesToOutline: THREE.SkinnedMesh[] = [];

  avatarScene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    if (mesh.userData.isInkOutline) return;

    const name = (mesh.name || '').toLowerCase();
    const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const matName = (origMat?.name || '').toLowerCase();
    const combinedName = `${name} ${matName}`;

    // Keep cornea / eye glossiness clear
    if (
      combinedName.includes('eye') ||
      combinedName.includes('cornea') ||
      combinedName.includes('iris') ||
      combinedName.includes('teeth')
    ) {
      return;
    }

    const origMap =
      origMat && 'map' in origMat ? ((origMat as THREE.MeshStandardMaterial).map ?? null) : null;

    const isSkinMesh =
      combinedName.includes('head') ||
      combinedName.includes('hand') ||
      combinedName.includes('skin') ||
      combinedName.includes('face') ||
      combinedName.includes('neck') ||
      combinedName.includes('wolf3d_head');

    const isHairMesh =
      combinedName.includes('hair') ||
      combinedName.includes('beard') ||
      combinedName.includes('brow') ||
      combinedName.includes('mustache');

    if (isHairMesh) {
      mesh.material = createPulpMaterial({
        highlightColor: '#3A2859',
        midtoneColor: '#1E1433',
        shadowColor: '#0E0A18',
        rimColor: '#F2C94C',
        hatchDensity: 1.35,
        map: origMap,
        mapBlend: 0.45,
      });
    } else if (isSkinMesh) {
      mesh.material = createPulpMaterial({
        isSkin: true,
        map: origMap,
        mapBlend: 0.62,
      });
    } else {
      // Mystic Violet & Shadow Plum Pulp Suit / Cloak
      mesh.material = createPulpMaterial({
        isSkin: false,
        map: origMap,
        mapBlend: 0.42,
      });
    }

    if (!mesh.userData.hasInkOutline && (mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      meshesToOutline.push(mesh as THREE.SkinnedMesh);
    }
  });

  // Attach Inverted-Hull India Ink Outlines safely after traversal
  meshesToOutline.forEach((skinnedMesh) => {
    const outlineMesh = new THREE.SkinnedMesh(skinnedMesh.geometry, outlineMaterial);
    outlineMesh.bind(skinnedMesh.skeleton, skinnedMesh.bindMatrix);
    outlineMesh.scale.multiplyScalar(1.018);
    outlineMesh.frustumCulled = false;
    outlineMesh.userData.isInkOutline = true;
    skinnedMesh.userData.hasInkOutline = true;
    skinnedMesh.parent?.add(outlineMesh);
  });
}

// ============================================================================
// 3. 3D PROP CEL-SHADER CONVERTER (For the 8 Section Stage Props)
// ============================================================================
export function applyPulpComicStyleToProp(
  propRoot: THREE.Object3D | null,
  palette: {
    highlightColor: string;
    midtoneColor: string;
    shadowColor: string;
    rimColor?: string;
    hatchDensity?: number;
  }
): void {
  if (!propRoot) return;

  const propMat = createPulpMaterial({
    highlightColor: palette.highlightColor,
    midtoneColor: palette.midtoneColor,
    shadowColor: palette.shadowColor,
    rimColor: palette.rimColor ?? '#F2C94C',
    hatchDensity: palette.hatchDensity ?? 0.95,
  });

  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#09080D'),
    side: THREE.BackSide,
  });

  const solidMeshes: THREE.Mesh[] = [];

  propRoot.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    if (mesh.userData.isInkOutline || mesh.userData.pulpStyled) return;

    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!mat) return;

    // Preserve additive energy glows, wireframes, and transparent rings
    const isWireframe = 'wireframe' in mat && (mat as THREE.MeshBasicMaterial).wireframe;
    const isTransparentGlow =
      mat.transparent && (mat.opacity < 0.75 || mat.blending === THREE.AdditiveBlending);

    if (isWireframe || isTransparentGlow) {
      return;
    }

    mesh.material = propMat;
    mesh.userData.pulpStyled = true;

    if (!(mesh as THREE.InstancedMesh).isInstancedMesh) {
      solidMeshes.push(mesh);
    }
  });

  solidMeshes.forEach((mesh) => {
    if (mesh.userData.hasInkOutline) return;
    const outline = new THREE.Mesh(mesh.geometry, outlineMat);
    outline.position.copy(mesh.position);
    outline.rotation.copy(mesh.rotation);
    outline.scale.copy(mesh.scale).multiplyScalar(1.035);
    outline.userData.isInkOutline = true;
    mesh.userData.hasInkOutline = true;
    mesh.parent?.add(outline);
  });
}

// ============================================================================
// 4. ANGULAR LILAC-STONE THRONE + SULFUR GOLD AURA HALO (Section 00 ORIGIN)
// ============================================================================
export function PulpThroneAndAura({
  position = [0.55, 0.0, -0.75] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  const auraRef = useRef<THREE.Mesh>(null!);
  const innerHaloRef = useRef<THREE.Mesh>(null!);
  const throneRef = useRef<THREE.Group>(null!);

  const stoneMaterial = useMemo(() => {
    return createPulpMaterial({
      highlightColor: '#DCD4EE',
      midtoneColor: '#CBC0E3',
      shadowColor: '#6E5B94',
      inkColor: '#09080D',
      rimColor: '#F2C94C',
      hatchDensity: 0.9,
    });
  }, []);

  const darkPlumStoneMaterial = useMemo(() => {
    return createPulpMaterial({
      highlightColor: '#9888B8',
      midtoneColor: '#5B3E96',
      shadowColor: '#2A194D',
      inkColor: '#09080D',
      rimColor: '#F2C94C',
      hatchDensity: 1.05,
    });
  }, []);

  const inkOutlineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#09080D'),
      side: THREE.BackSide,
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.045;
      auraRef.current.scale.set(pulse, pulse, 1);
    }
    if (innerHaloRef.current) {
      innerHaloRef.current.rotation.z = t * 0.18;
    }
  });

  return (
    <group ref={throneRef} position={position}>
      {/* Sulfur-Gold Glowing Halo Backdrop */}
      <mesh ref={auraRef} position={[0, 0.25, -0.45]}>
        <circleGeometry args={[1.95, 48]} />
        <meshBasicMaterial
          color="#F2C94C"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Warm Amber Rim Glow */}
      <mesh position={[0, 0.25, -0.52]}>
        <circleGeometry args={[2.55, 48]} />
        <meshBasicMaterial
          color="#D99B1E"
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Geometric Kirby-Style Sunburst Ring */}
      <mesh ref={innerHaloRef} position={[0, 0.55, -0.35]}>
        <ringGeometry args={[1.38, 1.46, 12]} />
        <meshBasicMaterial
          color="#F2C94C"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Angular Lilac-Stone Throne Monolith Backrest */}
      <group position={[0, 0.35, -0.22]}>
        <mesh material={stoneMaterial}>
          <cylinderGeometry args={[1.18, 0.92, 3.05, 6]} />
        </mesh>
        <mesh material={inkOutlineMaterial} scale={[1.035, 1.02, 1.035]}>
          <cylinderGeometry args={[1.18, 0.92, 3.05, 6]} />
        </mesh>
      </group>

      {/* Crown Spire Behind Avatar Head */}
      <group position={[0, 1.95, -0.25]} rotation={[0, Math.PI / 4, 0]}>
        <mesh material={darkPlumStoneMaterial}>
          <coneGeometry args={[0.72, 0.85, 4]} />
        </mesh>
        <mesh material={inkOutlineMaterial} scale={[1.05, 1.05, 1.05]}>
          <coneGeometry args={[0.72, 0.85, 4]} />
        </mesh>
      </group>

      {/* Left Angular Throne Armrest / Server Pillar */}
      <group position={[-1.08, -0.52, 0.15]} rotation={[0, 0, 0.16]}>
        <mesh material={stoneMaterial}>
          <boxGeometry args={[0.44, 1.75, 0.65]} />
        </mesh>
        <mesh material={inkOutlineMaterial} scale={[1.05, 1.03, 1.05]}>
          <boxGeometry args={[0.44, 1.75, 0.65]} />
        </mesh>
      </group>

      {/* Right Angular Throne Armrest / Server Pillar */}
      <group position={[1.08, -0.52, 0.15]} rotation={[0, 0, -0.16]}>
        <mesh material={stoneMaterial}>
          <boxGeometry args={[0.44, 1.75, 0.65]} />
        </mesh>
        <mesh material={inkOutlineMaterial} scale={[1.05, 1.03, 1.05]}>
          <boxGeometry args={[0.44, 1.75, 0.65]} />
        </mesh>
      </group>

      {/* Stepped Monolithic Throne Pedestal Base */}
      <group position={[0, -1.28, 0.05]}>
        <mesh material={darkPlumStoneMaterial}>
          <cylinderGeometry args={[1.45, 1.65, 0.28, 6]} />
        </mesh>
        <mesh material={inkOutlineMaterial} scale={[1.03, 1.06, 1.03]}>
          <cylinderGeometry args={[1.45, 1.65, 0.28, 6]} />
        </mesh>
      </group>

      {/* Sulfur-Gold Rim Point Light */}
      <pointLight position={[0, 1.1, 0.6]} color="#F2C94C" intensity={2.6} distance={5.5} decay={2} />
    </group>
  );
}

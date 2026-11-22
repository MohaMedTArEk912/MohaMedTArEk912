import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cameraTelemetry } from '../../hooks/useCameraTelemetry';

gsap.registerPlugin(ScrollTrigger);

export function CameraRig() {
  const progressRef = useRef({ value: 0 });
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // 8 3D Waypoints: Alternating zig-zag choreography across all sectors
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 0, 6.8),     // 00: Origin (text on left, 3D/avatar on right at X=2.3)
      new THREE.Vector3(0.6, -3.5, 6.5),   // 01: SWE (text on right, 3D/avatar on left at X=-2.4)
      new THREE.Vector3(-0.6, -7.5, 6.5),  // 02: Full-Stack (text on left, 3D/avatar on right at X=2.4)
      new THREE.Vector3(-0.6, -11.5, 6.5), // 03: Projects (text on left, 3D/avatar on right at X=2.5)
      new THREE.Vector3(0.6, -15.5, 6.5),  // 04: DevOps (text on right, 3D/avatar on left at X=-2.4)
      new THREE.Vector3(-0.6, -19.5, 6.5), // 05: Instructor (text on left, 3D/avatar on right at X=2.4)
      new THREE.Vector3(0.6, -23.5, 6.5),  // 06: PM (text on right, 3D/avatar on left at X=-2.4)
      new THREE.Vector3(0, -27.5, 5.0),    // 07: Command Gateway (centered terminal, avatar at X=2.5)
    ]);
  }, []);

  const lookAtPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.2, 0, 0),        // 00: target right (Gyro & Avatar)
      new THREE.Vector3(-1.2, -3.5, 0),    // 01: target left (Crystal & Avatar)
      new THREE.Vector3(1.2, -7.5, 0),     // 02: target right (Planes & Avatar)
      new THREE.Vector3(1.2, -11.5, 0),    // 03: target right (Architecture Core & Avatar)
      new THREE.Vector3(-1.2, -15.5, 0),   // 04: target left (Kubernetes Mesh & Avatar)
      new THREE.Vector3(1.2, -19.5, 0),    // 05: target right (Code Monolith & Avatar)
      new THREE.Vector3(-1.2, -23.5, 0),   // 06: target left (Radar & Avatar)
      new THREE.Vector3(0, -27.5, 0),      // 07: target center (Server Rack)
    ]);
  }, []);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-root',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.2,
      onUpdate: (self) => {
        progressRef.current.value = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const targetCamRef = useRef(new THREE.Vector3());
  const targetLookRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const p = THREE.MathUtils.clamp(progressRef.current.value, 0, 1);
    cameraPath.getPointAt(p, targetCamRef.current);
    lookAtPath.getPointAt(p, targetLookRef.current);

    const damping = 1 - Math.exp(-4.5 * delta);
    state.camera.position.lerp(targetCamRef.current, damping);

    currentLookAt.current.lerp(targetLookRef.current, damping);
    state.camera.lookAt(currentLookAt.current);

    cameraTelemetry.update(targetCamRef.current.x, targetCamRef.current.y, targetCamRef.current.z);
  });

  return null;
}

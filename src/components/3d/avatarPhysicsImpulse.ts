// Shared between the DOM controls and the on-demand 3D scene.
export const avatarPhysicsImpulse = {
  energy: 0,
  spinPulse: 0,
  smoothProgress: 0,
  smoothPointerX: 0,
  smoothPointerY: 0,
  trigger(strength = 1.0) {
    this.energy = Math.min(this.energy + strength * 0.75, 1.8);
    this.spinPulse = (Math.random() > 0.5 ? 1 : -1) * 0.16 * strength;
  },
};

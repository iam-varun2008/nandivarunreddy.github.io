import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const touch = event.touches[0];
  if (!touch) return;
  const mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  let restoreTimer: number | undefined;
  const centerTimer = window.setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03);
    restoreTimer = window.setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2);
    }, 1000);
  }, 2000);

  return () => {
    window.clearTimeout(centerTimer);
    window.clearTimeout(restoreTimer);
  };
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  projectPoseProgress: number,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number,
  scrollY: number,
  isDesktop: boolean
) => {
  if (scrollY < 200) {
    const cursorRotationStrength = 0.75;
    const maxRotation = Math.PI / 6;
    headBone.rotation.y = lerp(
      headBone.rotation.y,
      mouseX * maxRotation * cursorRotationStrength,
      interpolationY
    );
    const minRotationX = -0.3;
    const maxRotationX = 0.4;
    if (mouseY > minRotationX) {
      if (mouseY < maxRotationX) {
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          (-mouseY - 0.5 * maxRotation) * cursorRotationStrength,
          interpolationX
        );
      } else {
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          (-maxRotation - 0.5 * maxRotation) * cursorRotationStrength,
          interpolationX
        );
      }
    } else {
      headBone.rotation.x = lerp(
        headBone.rotation.x,
        (-minRotationX - 0.5 * maxRotation) * cursorRotationStrength,
        interpolationX
      );
    }
  } else if (isDesktop) {
    headBone.rotation.x = lerp(
      headBone.rotation.x,
      0.3 * projectPoseProgress,
      0.1
    );
    headBone.rotation.y = lerp(headBone.rotation.y, 0, 0.1);
    headBone.rotation.z = lerp(headBone.rotation.z, 0, 0.08);
  }
};

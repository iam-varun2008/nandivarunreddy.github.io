import type { RefObject } from "react";
import * as THREE from "three";

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: RefObject<HTMLDivElement | null>
) {
  const container = canvasDiv.current;
  if (!container) return;

  const { width, height } = container.getBoundingClientRect();
  if (width <= 0 || height <= 0) return;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

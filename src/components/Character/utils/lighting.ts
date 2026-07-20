import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { gsap } from "gsap";
import { resolvePublicAsset } from "../../../utils/resolvePublicAsset";

type ScreenLightMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

const setLighting = (scene: THREE.Scene) => {
  const directionalLight = new THREE.DirectionalLight(0xc7a9ff, 0);
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xc2a4ff, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  let environmentTexture: THREE.DataTexture | null = null;
  let disposed = false;
  const hdrLoader = new RGBELoader();
  hdrLoader.load(
    resolvePublicAsset("models/char_enviorment.hdr"),
    (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      environmentTexture = texture;
      scene.environment = texture;
      scene.environmentIntensity = 0;
      scene.environmentRotation.set(5.76, 85.85, 1);
    }
  );

  const setPointLight = (screenLight: THREE.Object3D | null) => {
    const mesh = screenLight as ScreenLightMesh | null;
    const material = mesh?.material;
    if (!material) {
      pointLight.intensity = 0;
      return;
    }

    pointLight.intensity =
      material.opacity > 0.9 ? material.emissiveIntensity * 20 : 0;
  };

  const turnOnLights = () => {
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(directionalLight, {
      intensity: 1,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  };

  const dispose = () => {
    disposed = true;
    gsap.killTweensOf(scene);
    gsap.killTweensOf(directionalLight);
    gsap.killTweensOf(".character-rim");
    if (scene.environment === environmentTexture) {
      scene.environment = null;
    }
    environmentTexture?.dispose();
    environmentTexture = null;
    directionalLight.dispose();
    pointLight.dispose();
    scene.remove(directionalLight, pointLight);
  };

  return { setPointLight, turnOnLights, dispose };
};

export default setLighting;

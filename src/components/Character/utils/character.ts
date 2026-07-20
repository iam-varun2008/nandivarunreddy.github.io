import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { resolvePublicAsset } from "../../../utils/resolvePublicAsset";
import { decryptFile } from "./decrypt";

const setCharacter = () => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(resolvePublicAsset("draco/"));
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = async (signal?: AbortSignal): Promise<GLTF> => {
    try {
      const decryptedModel = await decryptFile(
        resolvePublicAsset("models/character.enc"),
        "Character3D#@",
        signal
      );

      if (signal?.aborted) {
        throw new DOMException("Model loading was aborted.", "AbortError");
      }

      const gltf = await loader.parseAsync(
        decryptedModel,
        resolvePublicAsset("models/")
      );
      const character = gltf.scene;

      character.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = true;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => {
          if (material instanceof THREE.ShaderMaterial) {
            material.precision = "highp";
          }
        });
      });

      character.getObjectByName("footR")?.position.setY(3.36);
      character.getObjectByName("footL")?.position.setY(3.36);
      return gltf;
    } finally {
      dracoLoader.dispose();
    }
  };

  return { loadCharacter };
};

export default setCharacter;

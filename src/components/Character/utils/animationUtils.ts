import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

const setAnimations = (gltf: GLTF) => {
  const character = gltf.scene;
  const mixer = new THREE.AnimationMixer(character);
  let blinkTimer: number | undefined;
  let hoverCleanup: (() => void) | undefined;

  const introClip = THREE.AnimationClip.findByName(
    gltf.animations,
    "introAnimation"
  );
  if (introClip) {
    const introAction = mixer.clipAction(introClip);
    introAction.setLoop(THREE.LoopOnce, 1);
    introAction.clampWhenFinished = true;
    introAction.play();
  }

  ["key1", "key2", "key5", "key6"].forEach((name) => {
    const clip = THREE.AnimationClip.findByName(gltf.animations, name);
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.play();
    action.timeScale = 1.2;
  });

  const typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
  if (typingAction) {
    typingAction.enabled = true;
    typingAction.play();
    typingAction.timeScale = 1.2;
  }

  const startIntro = () => {
    if (introClip) {
      const introAction = mixer.clipAction(introClip);
      introAction.clampWhenFinished = true;
      introAction.reset().play();
    }

    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => {
      const blink = THREE.AnimationClip.findByName(gltf.animations, "Blink");
      if (blink) mixer.clipAction(blink).play().fadeIn(0.5);
    }, 2500);
  };

  const hover = (hoverDiv: HTMLDivElement) => {
    hoverCleanup?.();
    const eyebrowAction = createBoneAction(
      gltf,
      mixer,
      "browup",
      eyebrowBoneNames
    );
    let isHovering = false;

    if (eyebrowAction) {
      eyebrowAction.setLoop(THREE.LoopOnce, 1);
      eyebrowAction.clampWhenFinished = true;
      eyebrowAction.enabled = true;
    }

    const onHoverFace = () => {
      if (!eyebrowAction || isHovering) return;
      isHovering = true;
      eyebrowAction.reset();
      eyebrowAction.enabled = true;
      eyebrowAction.setEffectiveWeight(4);
      eyebrowAction.fadeIn(0.5).play();
    };

    const onLeaveFace = () => {
      if (!eyebrowAction || !isHovering) return;
      isHovering = false;
      eyebrowAction.fadeOut(0.6);
    };

    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);
    hoverCleanup = () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
    return hoverCleanup;
  };

  const dispose = () => {
    window.clearTimeout(blinkTimer);
    hoverCleanup?.();
    mixer.stopAllAction();
    mixer.uncacheRoot(character);
  };

  return { mixer, startIntro, hover, dispose };
};

const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clipName: string,
  boneNames: string[]
): THREE.AnimationAction | null => {
  const clip = THREE.AnimationClip.findByName(gltf.animations, clipName);
  if (!clip) return null;

  const filteredClip = filterAnimationTracks(clip, boneNames);
  return mixer.clipAction(filteredClip);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  return new THREE.AnimationClip(
    `${clip.name}_filtered`,
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;

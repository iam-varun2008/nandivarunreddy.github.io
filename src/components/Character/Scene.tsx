import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { setAllTimeline, setCharTimeline } from "../utils/GsapScroll";

const noop: () => void = () => {};

function disposeObject3D(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);

    const meshMaterials = mesh.material
      ? Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      : [];

    meshMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });

    const skinnedMesh = object as THREE.SkinnedMesh;
    if (skinnedMesh.skeleton?.boneTexture) {
      textures.add(skinnedMesh.skeleton.boneTexture);
    }
  });

  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    const containerElement = canvasDiv.current;
    if (!containerElement) return;

    let disposed = false;
    const scene = sceneRef.current;
    const initialRect = containerElement.getBoundingClientRect();
    const initialWidth = Math.max(initialRect.width, 1);
    const initialHeight = Math.max(initialRect.height, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initialWidth, initialHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    containerElement.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      14.5,
      initialWidth / initialHeight,
      0.1,
      1000
    );
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    const clock = new THREE.Clock(false);
    const lighting = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));
    const abortController = new AbortController();
    const { loadCharacter } = setCharacter();

    let character: THREE.Object3D | null = null;
    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let screenLight: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let animationsCleanup = noop;
    let characterTimelineCleanup = noop;
    let pageTimelineCleanup = noop;
    let touchResetCleanup = noop;
    let introTimer: number | undefined;
    let resizeTimer: number | undefined;
    let touchStartTimer: number | undefined;
    let animationFrameId = 0;
    let isRendering = false;
    let timelineDesktopState = window.innerWidth > 1024;
    let projectsSection: HTMLElement | null = null;
    let projectTransitionStart = 0;
    let projectTransitionRange = 1;
    let hasProjectMetrics = false;
    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };

    const refreshProjectMetrics = () => {
      projectsSection ||= document.getElementById("projects");
      if (!projectsSection) {
        hasProjectMetrics = false;
        return;
      }

      const projectsTop =
        projectsSection.getBoundingClientRect().top + window.scrollY;
      projectTransitionStart = projectsTop - window.innerHeight * 0.48;
      const transitionEnd = projectsTop - window.innerHeight * 0.12;
      projectTransitionRange = Math.max(
        transitionEnd - projectTransitionStart,
        1
      );
      hasProjectMetrics = true;
    };

    const getProjectPoseProgress = () => {
      if (!hasProjectMetrics) return 0;
      return THREE.MathUtils.clamp(
        (window.scrollY - projectTransitionStart) / projectTransitionRange,
        0,
        1
      );
    };

    const rebuildTimelines = () => {
      if (!character || disposed) return;
      characterTimelineCleanup();
      pageTimelineCleanup();
      timelineDesktopState = window.innerWidth > 1024;
      characterTimelineCleanup = setCharTimeline(character, camera);
      pageTimelineCleanup = setAllTimeline();
      window.requestAnimationFrame(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
    };

    const renderFrame = () => {
      if (disposed || document.hidden) {
        isRendering = false;
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);
      const delta = Math.min(clock.getDelta(), 0.05);
      mixer?.update(delta);

      const scrollY = window.scrollY;
      const isDesktop = window.innerWidth > 1024;
      const projectPoseProgress = getProjectPoseProgress();

      if (neckBone && scrollY >= 200 && isDesktop) {
        neckBone.rotation.x = THREE.MathUtils.lerp(
          neckBone.rotation.x,
          0,
          0.12
        );
        neckBone.rotation.y = THREE.MathUtils.lerp(
          neckBone.rotation.y,
          0,
          0.12
        );
        neckBone.rotation.z = THREE.MathUtils.lerp(
          neckBone.rotation.z,
          0,
          0.12
        );
      }

      if (headBone) {
        handleHeadRotation(
          headBone,
          projectPoseProgress,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp,
          scrollY,
          isDesktop
        );
      }

      lighting.setPointLight(screenLight);
      renderer.render(scene, camera);
    };

    const startRendering = () => {
      if (disposed || isRendering || document.hidden || !character) return;
      isRendering = true;
      clock.start();
      clock.getDelta();
      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    const stopRendering = () => {
      if (!isRendering) return;
      window.cancelAnimationFrame(animationFrameId);
      isRendering = false;
      clock.stop();
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopRendering();
      else startRendering();
    };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => {
        mouse = { x, y };
      });
    };

    const landingDiv = document.getElementById("landingDiv");
    const onTouchMove = (event: TouchEvent) => {
      handleTouchMove(event, (x, y) => {
        mouse = { x, y };
      });
    };
    const detachTouchMove = () => {
      landingDiv?.removeEventListener("touchmove", onTouchMove);
    };
    const onTouchStart = () => {
      window.clearTimeout(touchStartTimer);
      detachTouchMove();
      touchStartTimer = window.setTimeout(() => {
        landingDiv?.addEventListener("touchmove", onTouchMove, {
          passive: true,
        });
      }, 200);
    };
    const onTouchEnd = () => {
      window.clearTimeout(touchStartTimer);
      detachTouchMove();
      touchResetCleanup();
      touchResetCleanup = handleTouchEnd(
        (x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        }
      );
    };

    const onWindowResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        refreshProjectMetrics();
        const nextDesktopState = window.innerWidth > 1024;
        if (character && nextDesktopState !== timelineDesktopState) {
          rebuildTimelines();
        } else {
          ScrollTrigger.refresh();
        }
      }, 180);
    };

    const onLoaderComplete = () => {
      refreshProjectMetrics();
      ScrollTrigger.refresh();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize(renderer, camera, canvasDiv);
    });
    resizeObserver.observe(containerElement);

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", onWindowResize, { passive: true });
    window.addEventListener("load", onLoaderComplete, { once: true });
    window.addEventListener("portfolio:loader-complete", onLoaderComplete);
    ScrollTrigger.addEventListener("refresh", refreshProjectMetrics);
    landingDiv?.addEventListener("touchstart", onTouchStart, { passive: true });
    landingDiv?.addEventListener("touchend", onTouchEnd, { passive: true });

    refreshProjectMetrics();
    void document.fonts?.ready.then(() => {
      if (!disposed) onLoaderComplete();
    });

    void loadCharacter(abortController.signal)
      .then((gltf) => {
        if (disposed) {
          disposeObject3D(gltf.scene);
          return;
        }

        character = gltf.scene;
        scene.add(character);
        headBone = character.getObjectByName("spine006") || null;
        neckBone = character.getObjectByName("spine005") || null;
        screenLight = character.getObjectByName("screenlight") || null;

        const animations = setAnimations(gltf);
        mixer = animations.mixer;
        if (hoverDivRef.current) animations.hover(hoverDivRef.current);
        animationsCleanup = animations.dispose;

        rebuildTimelines();
        refreshProjectMetrics();
        startRendering();

        void progress.loaded().then(() => {
          if (disposed) return;
          introTimer = window.setTimeout(() => {
            if (disposed) return;
            lighting.turnOnLights();
            animations.startIntro();
          }, 2500);
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        progress.clear();
        console.error("Unable to load the 3D character:", error);
      });

    return () => {
      disposed = true;
      abortController.abort();
      stopRendering();
      progress.dispose();
      window.clearTimeout(introTimer);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(touchStartTimer);
      touchResetCleanup();
      detachTouchMove();
      resizeObserver.disconnect();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("load", onLoaderComplete);
      window.removeEventListener("portfolio:loader-complete", onLoaderComplete);
      ScrollTrigger.removeEventListener("refresh", refreshProjectMetrics);
      landingDiv?.removeEventListener("touchstart", onTouchStart);
      landingDiv?.removeEventListener("touchend", onTouchEnd);

      characterTimelineCleanup();
      pageTimelineCleanup();
      animationsCleanup();
      lighting.dispose();

      if (character) disposeObject3D(character);
      scene.clear();
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (containerElement.contains(renderer.domElement)) {
        containerElement.removeChild(renderer.domElement);
      }
    };
  }, [setLoading]);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
    </div>
  );
};

export default Scene;

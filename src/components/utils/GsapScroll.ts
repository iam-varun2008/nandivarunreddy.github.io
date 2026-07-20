import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type TimelineCleanup = () => void;

function killTimeline(timeline: gsap.core.Timeline) {
  timeline.scrollTrigger?.kill();
  timeline.kill();
}

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
): TimelineCleanup {
  let intensity = 0;
  const intensityInterval = window.setInterval(() => {
    intensity = Math.random();
  }, 200);
  const timelines: gsap.core.Timeline[] = [];
  let flickerTimeline: gsap.core.Timeline | null = null;
  let screenLight: THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshStandardMaterial
  > | null = null;
  let monitor: THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshStandardMaterial
  > | null = null;

  character?.children.forEach((object) => {
    if (object.name === "Plane004") {
      object.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh) || Array.isArray(child.material)) {
          return;
        }
        const material = child.material as THREE.MeshStandardMaterial;
        material.transparent = true;
        material.opacity = 0;
        if (material.name === "Material.027") {
          monitor = child as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshStandardMaterial
          >;
          material.color.set("#FFFFFF");
        }
      });
    }

    if (
      object.name === "screenlight" &&
      object instanceof THREE.Mesh &&
      !Array.isArray(object.material)
    ) {
      const material = object.material as THREE.MeshStandardMaterial;
      material.transparent = true;
      material.opacity = 0;
      material.emissive.set("#C8BFFF");
      flickerTimeline = gsap
        .timeline({ repeat: -1, repeatRefresh: true })
        .to(material, {
          emissiveIntensity: () => intensity * 8,
          duration: () => Math.random() * 0.6,
          delay: () => Math.random() * 0.1,
        });
      screenLight = object as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshStandardMaterial
      >;
    }
  });

  const monitorMesh = monitor as THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshStandardMaterial
  > | null;
  const screenLightMesh = screenLight as THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshStandardMaterial
  > | null;

  if (window.innerWidth > 1024 && character) {
    const landingTimeline = gsap.timeline({
      scrollTrigger: {
        id: "character-landing",
        trigger: ".landing-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    landingTimeline
      .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
      .to(camera.position, { z: 22 }, 0)
      .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
      .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
      .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
      .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);
    timelines.push(landingTimeline);

    const aboutTimeline = gsap.timeline({
      scrollTrigger: {
        id: "character-about",
        trigger: ".about-section",
        start: "center 55%",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    aboutTimeline
      .to(
        camera.position,
        { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
        0
      )
      .to(".about-section", { y: "30%", duration: 6 }, 0)
      .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
      .fromTo(
        ".character-model",
        { pointerEvents: "inherit" },
        { pointerEvents: "none", x: "-30%", delay: 2, duration: 5 },
        0
      )
      .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
      .fromTo(
        ".what-box-in",
        { display: "none" },
        { display: "flex", duration: 0.1, delay: 6 },
        0
      )
      .fromTo(
        ".character-rim",
        { opacity: 1, scaleX: 1.4 },
        { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
        0.3
      );

    if (monitorMesh) {
      aboutTimeline
        .to(monitorMesh.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
        .fromTo(
          monitorMesh.position,
          { y: -10, z: 2 },
          { y: 0, z: 0, delay: 1.5, duration: 3 },
          0
        );
    }

    if (screenLightMesh) {
      aboutTimeline.to(
        screenLightMesh.material,
        { opacity: 1, duration: 0.8, delay: 4.5 },
        0
      );
    }
    timelines.push(aboutTimeline);

    const projectExitTimeline = gsap.timeline({
      scrollTrigger: {
        id: "projects-character-exit",
        trigger: ".projects-scroll-shell",
        start: "85% top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    projectExitTimeline
      .fromTo(
        ".character-model",
        { y: "0%" },
        { y: "-100%", duration: 1, ease: "none" },
        0
      )
      .to(character.rotation, { x: -0.04, duration: 1, ease: "none" }, 0);
    timelines.push(projectExitTimeline);
  } else if (character) {
    const mobileTimeline = gsap.timeline({
      scrollTrigger: {
        id: "character-mobile-projects",
        trigger: ".what-box-in",
        start: "top 70%",
        end: "bottom top",
      },
    });
    mobileTimeline.to(
      ".what-box-in",
      { display: "flex", duration: 0.1, delay: 0 },
      0
    );
    timelines.push(mobileTimeline);
  }

  return () => {
    window.clearInterval(intensityInterval);
    flickerTimeline?.kill();
    timelines.forEach(killTimeline);
  };
}

export function setAllTimeline(): TimelineCleanup {
  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      id: "career-timeline",
      trigger: ".career-section",
      start: "top 50%",
      end: "bottom 30%",
      scrub: 1.5,
      invalidateOnRefresh: true,
    },
  });

  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "0%" },
      { maxHeight: "100%", duration: 1, ease: "none" },
      0
    )
    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
      0
    )
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      { animationIterationCount: "1", delay: 0.3, duration: 0.1 },
      0
    )
    .fromTo(
      ".career-section",
      { y: 0 },
      {
        y: window.innerWidth > 1024 ? "20%" : 0,
        duration: 0.5,
        delay: 0.2,
      },
      0
    );

  return () => killTimeline(careerTimeline);
}

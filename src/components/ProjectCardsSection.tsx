import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type SecurityProject } from "../data/projects";
import { resolvePublicAsset } from "../utils/resolvePublicAsset";
import GlassOrbs from "./GlassOrbs";
import "./styles/WhatIDo.css";
import "./styles/FloatingBubbleCard.css";

gsap.registerPlugin(ScrollTrigger);

type LightboxState = {
  projectIndex: number;
  screenshotIndex: number;
} | null;

const wrapIndex = (index: number, length: number) =>
  (index + length) % length;

function setProjectCardInteraction(
  card: HTMLElement,
  active: boolean
): void {
  card.style.pointerEvents = active ? "auto" : "none";
  card.setAttribute("aria-hidden", active ? "false" : "true");

  const interactiveElements = card.querySelectorAll<HTMLElement>(
    "a, button, input, select, textarea, [tabindex]"
  );

  interactiveElements.forEach((element) => {
    if (active) {
      const previousTabIndex = element.dataset.previousTabIndex;

      if (previousTabIndex !== undefined) {
        if (previousTabIndex === "") {
          element.removeAttribute("tabindex");
        } else {
          element.setAttribute("tabindex", previousTabIndex);
        }

        delete element.dataset.previousTabIndex;
      }
    } else {
      if (element.dataset.previousTabIndex === undefined) {
        element.dataset.previousTabIndex =
          element.getAttribute("tabindex") ?? "";
      }

      element.setAttribute("tabindex", "-1");
    }
  });
}

const ProjectCardsSection = () => {
  const projectSectionRef = useRef<HTMLElement>(null);
  const projectPinStageRef = useRef<HTMLDivElement>(null);
  const projectCardStackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLElement>(null);
  const secondCardRef = useRef<HTMLElement>(null);
  const imageCloseRef = useRef<HTMLButtonElement>(null);
  const demoCloseRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [screenshotIndexes, setScreenshotIndexes] = useState<
    Record<string, number>
  >(() => Object.fromEntries(projects.map((project) => [project.id, 0])));
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [lightboxLoading, setLightboxLoading] = useState(false);
  const [lightboxError, setLightboxError] = useState(false);
  const [demoProject, setDemoProject] = useState<SecurityProject | null>(null);

  useLayoutEffect(() => {
    const projectSection = projectSectionRef.current;
    const projectPinStage = projectPinStageRef.current;
    const projectCardStack = projectCardStackRef.current;
    const firstCard = firstCardRef.current;
    const secondCard = secondCardRef.current;
    if (
      !projectSection ||
      !projectPinStage ||
      !projectCardStack ||
      !firstCard ||
      !secondCard
    ) {
      return;
    }

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(min-width: 901px)", () => {
        gsap.set(firstCard, {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          filter: "brightness(1)",
          zIndex: 1,
        });

        gsap.set(secondCard, {
          yPercent: 115,
          scale: 1,
          opacity: 1,
          zIndex: 2,
          pointerEvents: "none",
        });

        setProjectCardInteraction(firstCard, true);
        setProjectCardInteraction(secondCard, false);

        const timeline = gsap.timeline({
          scrollTrigger: {
            id: "projects-pinned-card-transition",
            trigger: projectSection,
            start: "top top",
            end: "+=120%",
            scrub: 0.8,
            pin: projectPinStage,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const secondProjectIsActive = self.progress >= 0.78;
              setProjectCardInteraction(firstCard, !secondProjectIsActive);
              setProjectCardInteraction(secondCard, secondProjectIsActive);
            },
            onLeaveBack: () => {
              setProjectCardInteraction(firstCard, true);
              setProjectCardInteraction(secondCard, false);
            },
            onLeave: () => {
              setProjectCardInteraction(firstCard, false);
              setProjectCardInteraction(secondCard, true);
            },
          },
        });

        timeline
          .to(
            firstCard,
            {
              yPercent: -7,
              scale: 0.95,
              opacity: 0.48,
              filter: "brightness(0.58)",
              ease: "none",
            },
            0
          )
          .to(
            secondCard,
            {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              ease: "none",
            },
            0
          );

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      });

      media.add("(max-width: 900px)", () => {
        gsap.set([firstCard, secondCard], {
          clearProps: "transform,opacity,filter,pointerEvents,zIndex",
        });
        setProjectCardInteraction(firstCard, true);
        setProjectCardInteraction(secondCard, true);
      });
    }, projectSection);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  useEffect(() => {
    const projectSection = projectSectionRef.current;
    if (!projectSection) return;

    let resizeFrame = 0;
    const refresh = () => ScrollTrigger.refresh();
    const refreshAfterResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(refresh);
    };
    const images = Array.from(projectSection.querySelectorAll("img"));

    images.forEach((image) => {
      if (!image.complete) image.addEventListener("load", refresh, { once: true });
    });
    window.addEventListener("load", refresh, { once: true });
    window.addEventListener("resize", refreshAfterResize);
    void document.fonts?.ready.then(refresh);
    const initialFrame = window.requestAnimationFrame(refresh);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refreshAfterResize);
      images.forEach((image) => image.removeEventListener("load", refresh));
    };
  }, []);

  const moveScreenshot = useCallback(
    (project: SecurityProject, direction: number) => {
      setScreenshotIndexes((currentIndexes) => {
        const currentIndex = currentIndexes[project.id] ?? 0;
        return {
          ...currentIndexes,
          [project.id]: wrapIndex(
            currentIndex + direction,
            project.screenshots.length
          ),
        };
      });
    },
    []
  );

  const selectScreenshot = useCallback(
    (project: SecurityProject, screenshotIndex: number) => {
      setScreenshotIndexes((currentIndexes) => ({
        ...currentIndexes,
        [project.id]: screenshotIndex,
      }));
    },
    []
  );

  const moveLightbox = useCallback((direction: number) => {
    setLightboxLoading(true);
    setLightboxError(false);
    setLightbox((currentLightbox) => {
      if (!currentLightbox) return null;
      const screenshotCount =
        projects[currentLightbox.projectIndex].screenshots.length;
      return {
        ...currentLightbox,
        screenshotIndex: wrapIndex(
          currentLightbox.screenshotIndex + direction,
          screenshotCount
        ),
      };
    });
  }, []);

  const restoreFocus = useCallback(() => {
    window.requestAnimationFrame(() => lastFocusedElementRef.current?.focus());
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    setLightboxLoading(false);
    setLightboxError(false);
    restoreFocus();
  }, [restoreFocus]);

  const closeDemo = useCallback(() => {
    setDemoProject(null);
    restoreFocus();
  }, [restoreFocus]);

  const lightboxOpen = lightbox !== null;

  useEffect(() => {
    if (!lightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => imageCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, lightboxOpen, moveLightbox]);

  useEffect(() => {
    if (!demoProject) return;
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDemo();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => demoCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDemo, demoProject]);

  const openLightbox = (
    projectIndex: number,
    screenshotIndex: number,
    event: ReactMouseEvent<HTMLButtonElement>
  ) => {
    lastFocusedElementRef.current = event.currentTarget;
    setLightboxLoading(true);
    setLightboxError(false);
    setLightbox({ projectIndex, screenshotIndex });
  };

  const openDemo = (
    project: SecurityProject,
    event: ReactMouseEvent<HTMLButtonElement>
  ) => {
    lastFocusedElementRef.current = event.currentTarget;
    setDemoProject(project);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const distance = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(distance) >= 45) moveLightbox(distance > 0 ? -1 : 1);
  };

  const lightboxProject = lightbox ? projects[lightbox.projectIndex] : null;
  const lightboxScreenshot =
    lightbox && lightboxProject
      ? lightboxProject.screenshots[lightbox.screenshotIndex]
      : null;

  return (
    <>
      <section
        className="whatIDO project-section"
        id="projects"
        ref={projectSectionRef}
      >
        <div className="project-pin-stage" ref={projectPinStageRef}>
          <div className="project-title-area">
          <h2 className="title project-section-title">PROJECTS</h2>
          </div>
          <div className="project-card-stack" ref={projectCardStackRef}>
            {projects.map((project, projectIndex) => {
              const screenshotIndex = screenshotIndexes[project.id] ?? 0;
              const screenshot = project.screenshots[screenshotIndex];
              const technologies = project.technology
                .split(/,|\sand\s/i)
                .map((technology) => technology.trim())
                .filter(Boolean);

              return (
                <article
                  className={`project-card project-card-${
                    projectIndex === 0 ? "first" : "second"
                  } floating-glass-card`}
                  key={project.id}
                  ref={projectIndex === 0 ? firstCardRef : secondCardRef}
                >
                    <GlassOrbs />
                    <div className="project-card-media">
                      <button
                        className="project-screenshot-button"
                        type="button"
                        onClick={(event) =>
                          openLightbox(projectIndex, screenshotIndex, event)
                        }
                        aria-label={`Open screenshot ${screenshotIndex + 1} of ${
                          project.screenshots.length
                        } for ${project.title}`}
                      >
                        <img
                          key={`${project.id}-${screenshotIndex}`}
                          src={resolvePublicAsset(screenshot.src)}
                          alt={screenshot.alt}
                          loading="lazy"
                        />
                      </button>
                      <button
                        className="project-carousel-arrow project-carousel-arrow-previous"
                        type="button"
                        aria-label="Previous screenshot"
                        onClick={() => moveScreenshot(project, -1)}
                      >
                        <span aria-hidden="true">‹</span>
                      </button>
                      <button
                        className="project-carousel-arrow project-carousel-arrow-next"
                        type="button"
                        aria-label="Next screenshot"
                        onClick={() => moveScreenshot(project, 1)}
                      >
                        <span aria-hidden="true">›</span>
                      </button>
                      <div className="project-screenshot-dots" aria-label="Choose screenshot">
                        {project.screenshots.map((item, index) => (
                          <button
                            key={item.src}
                            className={index === screenshotIndex ? "is-current" : ""}
                            type="button"
                            aria-label={`Show screenshot ${index + 1}: ${item.caption}`}
                            aria-current={index === screenshotIndex ? "true" : undefined}
                            onClick={() => selectScreenshot(project, index)}
                          />
                        ))}
                      </div>
                      <span className="project-screenshot-counter" aria-live="polite">
                        {screenshotIndex + 1} / {project.screenshots.length}
                      </span>
                      <span className="project-number">{project.number}</span>
                    </div>
                    <div className="what-content-in project-card-body project-card-content">
                      <p className="project-category">{project.category}</p>
                      <h3>{project.title}</h3>
                      <p className="what-project-description">{project.description}</p>
                      <div className="project-card-lower">
                        <div>
                          <p className="project-meta-label">Technology</p>
                          <div className="what-content-flex">
                            {technologies.map((technology) => (
                              <span className="what-tags" key={technology}>
                                {technology}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ul
                          className="project-feature-summary"
                          aria-label="Feature summary"
                        >
                          {project.features.slice(0, 3).map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="what-actions project-card-actions">
                        <button
                          className="project-action project-action-primary"
                          type="button"
                          onClick={(event) => openDemo(project, event)}
                        >
                          View Demo
                        </button>
                        <a
                          className="project-action project-action-secondary"
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      </div>
                    </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {lightbox && lightboxProject && lightboxScreenshot && (
        <div
          className="project-lightbox-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <section
            className="project-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${lightboxProject.title} screenshot viewer`}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              ref={imageCloseRef}
              className="project-lightbox-close"
              type="button"
              onClick={closeLightbox}
              aria-label="Close screenshot viewer"
            >
              ×
            </button>
            <button
              className="project-lightbox-arrow project-lightbox-arrow-previous"
              type="button"
              onClick={() => moveLightbox(-1)}
              aria-label="Previous screenshot"
            >
              ‹
            </button>
            <figure className="project-lightbox-figure">
              <div className="project-lightbox-image-wrapper">
                {lightboxLoading && !lightboxError && (
                  <div className="project-lightbox-loading" role="status">
                    Loading screenshot…
                  </div>
                )}
                {lightboxError ? (
                  <p className="project-lightbox-error" role="alert">
                    Unable to load this screenshot.
                  </p>
                ) : (
                  <img
                    key={`${lightboxProject.id}-${lightbox.screenshotIndex}`}
                    className={`project-lightbox-image${
                      lightboxLoading ? " is-loading" : ""
                    }`}
                    src={resolvePublicAsset(lightboxScreenshot.src)}
                    alt={lightboxScreenshot.alt}
                    onLoad={() => {
                      setLightboxLoading(false);
                      setLightboxError(false);
                    }}
                    onError={(event) => {
                      console.error(
                        "Failed to load lightbox screenshot:",
                        event.currentTarget.src
                      );
                      setLightboxLoading(false);
                      setLightboxError(true);
                    }}
                  />
                )}
              </div>
              <figcaption className="project-lightbox-caption">
                <strong>{lightboxProject.title}</strong>
                <span>{lightboxScreenshot.caption}</span>
                <small>
                  {lightbox.screenshotIndex + 1} / {lightboxProject.screenshots.length}
                </small>
              </figcaption>
            </figure>
            <button
              className="project-lightbox-arrow project-lightbox-arrow-next"
              type="button"
              onClick={() => moveLightbox(1)}
              aria-label="Next screenshot"
            >
              ›
            </button>
          </section>
        </div>
      )}

      {demoProject && (
        <div
          className="project-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDemo();
          }}
        >
          <section
            className="project-dialog floating-glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-demo-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <GlassOrbs />
            <button
              ref={demoCloseRef}
              className="project-dialog-close"
              type="button"
              onClick={closeDemo}
              aria-label="Close project demo"
            >
              ×
            </button>
            <p className="project-category">Project demo</p>
            <h2 id="project-demo-title">{demoProject.title}</h2>
            <video
              className="project-demo-video"
              controls
              playsInline
              preload="metadata"
            >
              <source
                src={resolvePublicAsset(demoProject.demoVideo)}
                type="video/mp4"
              />
              Your browser does not support this project demo video.
            </video>
          </section>
        </div>
      )}
    </>
  );
};

export default ProjectCardsSection;

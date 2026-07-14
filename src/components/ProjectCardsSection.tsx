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
import "./styles/WhatIDo.css";
import "./styles/FloatingBubbleCard.css";

gsap.registerPlugin(ScrollTrigger);

type ImageViewerState = {
  projectIndex: number;
  screenshotIndex: number;
};

const wrapIndex = (index: number, length: number) =>
  (index + length) % length;

const ProjectCardsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageCloseRef = useRef<HTMLButtonElement>(null);
  const demoCloseRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [stackedLayout, setStackedLayout] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 901px)").matches
      : true
  );
  const [screenshotIndexes, setScreenshotIndexes] = useState<
    Record<string, number>
  >(() => Object.fromEntries(projects.map((project) => [project.id, 0])));
  const [imageViewer, setImageViewer] = useState<ImageViewerState | null>(null);
  const [demoProject, setDemoProject] = useState<SecurityProject | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 901px)");
    const updateLayout = () => {
      setStackedLayout(mediaQuery.matches);
      if (!mediaQuery.matches) setActiveCardIndex(0);
    };

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(min-width: 901px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".project-card", section);
        if (cards.length < 2) return;

        setActiveCardIndex(0);
        gsap.set(cards[0], { zIndex: 2, transformOrigin: "50% 50%" });
        gsap.set(cards[1], {
          zIndex: 3,
          xPercent: 7,
          yPercent: 88,
          transformOrigin: "50% 50%",
        });

        gsap
          .timeline({
            scrollTrigger: {
              id: "portfolio-project-card-stack",
              trigger: stage,
              start: "top 16%",
              end: "bottom 84%",
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const nextActiveIndex = self.progress < 0.5 ? 0 : 1;
                setActiveCardIndex((currentIndex) =>
                  currentIndex === nextActiveIndex
                    ? currentIndex
                    : nextActiveIndex
                );
              },
            },
          })
          .to(
            cards[0],
            { scale: 0.955, yPercent: -4, opacity: 0.64, ease: "none" },
            0
          )
          .to(
            cards[1],
            { xPercent: 0, yPercent: 0, opacity: 1, ease: "none" },
            0
          );
      });
    }, section);

    return () => {
      media.revert();
      context.revert();
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

  const moveImageViewer = useCallback((direction: number) => {
    setImageViewer((currentViewer) => {
      if (!currentViewer) return null;
      const screenshotCount =
        projects[currentViewer.projectIndex].screenshots.length;
      return {
        ...currentViewer,
        screenshotIndex: wrapIndex(
          currentViewer.screenshotIndex + direction,
          screenshotCount
        ),
      };
    });
  }, []);

  const restoreFocus = useCallback(() => {
    window.requestAnimationFrame(() => lastFocusedElementRef.current?.focus());
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewer(null);
    restoreFocus();
  }, [restoreFocus]);

  const closeDemo = useCallback(() => {
    setDemoProject(null);
    restoreFocus();
  }, [restoreFocus]);

  useEffect(() => {
    if (!imageViewer) return;
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeImageViewer();
      if (event.key === "ArrowLeft") moveImageViewer(-1);
      if (event.key === "ArrowRight") moveImageViewer(1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => imageCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeImageViewer, imageViewer, moveImageViewer]);

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

  const openImageViewer = (
    projectIndex: number,
    screenshotIndex: number,
    event: ReactMouseEvent<HTMLButtonElement>
  ) => {
    lastFocusedElementRef.current = event.currentTarget;
    setImageViewer({ projectIndex, screenshotIndex });
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
    if (Math.abs(distance) >= 45) moveImageViewer(distance > 0 ? -1 : 1);
  };

  const viewerProject = imageViewer
    ? projects[imageViewer.projectIndex]
    : null;
  const viewerScreenshot =
    imageViewer && viewerProject
      ? viewerProject.screenshots[imageViewer.screenshotIndex]
      : null;

  return (
    <>
      <div className="whatIDO" id="projects" ref={sectionRef}>
        <div className="what-box">
          <h2 className="title project-section-title">PROJECTS</h2>
        </div>
        <div className="what-box">
          <div className="what-box-in project-stack-stage" ref={stageRef}>
            <div className="project-stack-sticky">
              {projects.map((project, projectIndex) => {
                const screenshotIndex = screenshotIndexes[project.id] ?? 0;
                const screenshot = project.screenshots[screenshotIndex];
                const isInteractive =
                  !stackedLayout || projectIndex === activeCardIndex;
                const technologies = project.technology
                  .split(/,|\sand\s/i)
                  .map((technology) => technology.trim())
                  .filter(Boolean);

                return (
                  <article
                    className={`what-content project-card floating-glass-card ${
                      isInteractive ? "is-active" : "is-inactive"
                    }`}
                    key={project.id}
                    aria-hidden={stackedLayout && !isInteractive ? true : undefined}
                  >
                    <div className="project-card-media">
                      <button
                        className="project-screenshot-button"
                        type="button"
                        onClick={(event) =>
                          openImageViewer(projectIndex, screenshotIndex, event)
                        }
                        aria-label={`Open screenshot ${screenshotIndex + 1} of ${
                          project.screenshots.length
                        } for ${project.title}`}
                        disabled={!isInteractive}
                        tabIndex={isInteractive ? 0 : -1}
                      >
                        <img
                          key={`${project.id}-${screenshotIndex}`}
                          src={screenshot.src}
                          alt={screenshot.alt}
                          loading="lazy"
                        />
                      </button>
                      <button
                        className="project-carousel-arrow project-carousel-arrow-previous"
                        type="button"
                        aria-label="Previous screenshot"
                        onClick={() => moveScreenshot(project, -1)}
                        disabled={!isInteractive}
                        tabIndex={isInteractive ? 0 : -1}
                      >
                        <span aria-hidden="true">‹</span>
                      </button>
                      <button
                        className="project-carousel-arrow project-carousel-arrow-next"
                        type="button"
                        aria-label="Next screenshot"
                        onClick={() => moveScreenshot(project, 1)}
                        disabled={!isInteractive}
                        tabIndex={isInteractive ? 0 : -1}
                      >
                        <span aria-hidden="true">›</span>
                      </button>
                      <div className="project-screenshot-dots" aria-label="Choose screenshot">
                        {project.screenshots.map((item, index) => (
                          <button
                            key={item.src}
                            className={index === screenshotIndex ? "is-current" : ""}
                            type="button"
                            aria-label={`Show screenshot ${index + 1}: ${item.alt}`}
                            aria-current={index === screenshotIndex ? "true" : undefined}
                            onClick={() => selectScreenshot(project, index)}
                            disabled={!isInteractive}
                            tabIndex={isInteractive ? 0 : -1}
                          />
                        ))}
                      </div>
                      <span className="project-screenshot-counter" aria-live="polite">
                        {screenshotIndex + 1} / {project.screenshots.length}
                      </span>
                      <span className="project-number">{project.number}</span>
                    </div>
                    <div className="what-content-in project-card-body">
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
                      <div className="what-actions">
                        <button
                          className="project-action project-action-primary"
                          type="button"
                          onClick={(event) => openDemo(project, event)}
                          disabled={!isInteractive}
                          tabIndex={isInteractive ? 0 : -1}
                        >
                          View Demo
                        </button>
                        <a
                          className="project-action project-action-secondary"
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isInteractive ? 0 : -1}
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
        </div>
      </div>

      {viewerProject && viewerScreenshot && imageViewer && (
        <div
          className="project-lightbox-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeImageViewer();
          }}
        >
          <section
            className="project-lightbox floating-glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-lightbox-caption"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              ref={imageCloseRef}
              className="project-lightbox-close"
              type="button"
              onClick={closeImageViewer}
              aria-label="Close screenshot viewer"
            >
              ×
            </button>
            <button
              className="project-lightbox-arrow project-lightbox-arrow-previous"
              type="button"
              onClick={() => moveImageViewer(-1)}
              aria-label="Previous screenshot"
            >
              ‹
            </button>
            <figure>
              <img src={viewerScreenshot.src} alt={viewerScreenshot.alt} />
              <figcaption id="project-lightbox-caption">
                <strong>{viewerProject.title}</strong>
                <span>{viewerScreenshot.alt}</span>
                <small>
                  {imageViewer.screenshotIndex + 1} / {viewerProject.screenshots.length}
                </small>
              </figcaption>
            </figure>
            <button
              className="project-lightbox-arrow project-lightbox-arrow-next"
              type="button"
              onClick={() => moveImageViewer(1)}
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
              <source src={demoProject.demoUrl} type="video/mp4" />
              Your browser does not support this project demo video.
            </video>
          </section>
        </div>
      )}
    </>
  );
};

export default ProjectCardsSection;

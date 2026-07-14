import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type SecurityProject } from "../data/projects";
import "./styles/WhatIDo.css";
import "./styles/FloatingBubbleCard.css";

gsap.registerPlugin(ScrollTrigger);

const ProjectCardsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [demoProject, setDemoProject] = useState<SecurityProject | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(min-width: 901px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".project-card", section);
        if (cards.length < 2) return;

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

  useEffect(() => {
    if (!demoProject) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDemoProject(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [demoProject]);

  return (
    <>
      <div className="whatIDO" id="projects" ref={sectionRef}>
        <div className="what-box">
          <h2 className="title project-section-title">PROJECTS</h2>
        </div>
        <div className="what-box">
          <div className="what-box-in project-stack-stage" ref={stageRef}>
            <div className="project-stack-sticky">
              {projects.map((project) => {
                const preview = project.screenshots[2] ?? project.screenshots[0];
                const technologies = project.technology
                  .split(/,|\sand\s/i)
                  .map((technology) => technology.trim())
                  .filter(Boolean);

                return (
                  <article
                    className="what-content project-card floating-bubble-card"
                    key={project.id}
                  >
                    <div className="project-card-media">
                      <img src={preview.src} alt={preview.alt} loading="lazy" />
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
                        <ul className="project-feature-summary" aria-label="Feature summary">
                          {project.features.slice(0, 3).map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="what-actions">
                        <button
                          className="project-action project-action-primary"
                          type="button"
                          onClick={() => setDemoProject(project)}
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
        </div>
      </div>

      {demoProject && (
        <div
          className="project-dialog-backdrop"
          role="presentation"
          onMouseDown={() => setDemoProject(null)}
        >
          <section
            className="project-dialog floating-bubble-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-demo-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="project-dialog-close"
              type="button"
              onClick={() => setDemoProject(null)}
              aria-label="Close project demo"
            >
              ×
            </button>
            <p className="project-category">Project demo</p>
            <h2 id="project-demo-title">{demoProject.title}</h2>
            <video className="project-demo-video" controls autoPlay playsInline>
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

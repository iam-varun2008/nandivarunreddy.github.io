/* Previous compact project list retained for reference.
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type SecurityProject } from "../data/projects";
import "./styles/WhatIDo.css";

const WhatIDid = () => {
  const [activeProject, setActiveProject] = useState<SecurityProject | null>(null);

  useEffect(() => {
    if (!activeProject) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveProject(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeProject]);

  return (
    <>
      <div className="whatIDO" id="projects">
        <div className="what-box">
          <h2 className="title">
            W<span className="hat-h2">HAT</span>
            <div>
              &nbsp;I<span className="do-h2"> DID</span>
            </div>
          </h2>
        </div>
        <div className="what-box">
          <div className="what-box-in">
            <div className="what-border2">
              <svg width="100%" aria-hidden="true">
                <line x1="0" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
                <line x1="100%" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
              </svg>
            </div>
            {projects.map((project) => (
              <div
                className={`what-content ${ScrollTrigger.isTouch ? "" : "what-noTouch"}`}
                key={project.id}
                onClick={(event) => {
                  if (ScrollTrigger.isTouch) handleClick(event.currentTarget);
                }}
              >
                <div className="what-border1">
                  <svg height="100%" aria-hidden="true">
                    <line x1="0" y1="0" x2="100%" y2="0" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                    <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                  </svg>
                </div>
                <div className="what-corner"></div>
                <div className="what-content-in">
                  <h3>{project.title}</h3>
                  <h4>{project.category}</h4>
                  <p className="what-project-description">{project.description}</p>
                  <h5>Technology</h5>
                  <div className="what-content-flex">
                    <div className="what-tags">{project.technology}</div>
                  </div>
                  <div className="what-actions" onClick={(event) => event.stopPropagation()}>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub repository</a>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Demo</a>
                    <button type="button" onClick={() => setActiveProject(project)}>Project details</button>
                  </div>
                  <div className="what-gallery" onClick={(event) => event.stopPropagation()}>
                    {project.screenshots.map((screenshot) => (
                      <a key={screenshot.src} href={screenshot.src} target="_blank" rel="noopener noreferrer">
                        <img src={screenshot.src} alt={screenshot.alt} loading="lazy" />
                      </a>
                    ))}
                  </div>
                  <div className="what-arrow"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeProject && (
        <div className="project-dialog-backdrop" role="presentation" onMouseDown={() => setActiveProject(null)}>
          <section
            className="project-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="project-dialog-close" type="button" onClick={() => setActiveProject(null)} aria-label="Close project details">×</button>
            <p>{activeProject.category}</p>
            <h2 id="project-dialog-title">{activeProject.title}</h2>
            <p>{activeProject.description}</p>
            <h3>Main features</h3>
            <ul>
              {activeProject.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <div className="project-dialog-actions">
              <a href={activeProject.githubUrl} target="_blank" rel="noopener noreferrer">View GitHub repository</a>
              <a href={activeProject.demoUrl} target="_blank" rel="noopener noreferrer">Watch demo</a>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  const siblings = Array.from(container.parentElement?.children ?? []);
  siblings.forEach((sibling) => {
    if (sibling !== container && sibling.classList.contains("what-content")) {
      sibling.classList.remove("what-content-active");
      sibling.classList.toggle("what-sibling");
    }
  });
}

export default WhatIDid;
*/

export { default } from "./ProjectCardsSection";

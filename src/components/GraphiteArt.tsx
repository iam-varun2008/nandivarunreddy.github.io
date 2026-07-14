import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { artworks, artworkIntro, type Artwork } from "../data/artwork";
import "./styles/Work.css";
import "./styles/FloatingBubbleCard.css";

gsap.registerPlugin(ScrollTrigger);

const GraphiteArt = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    let translateX = 0;
    const measure = () => {
      const boxes = document.getElementsByClassName("work-box");
      const container = document.querySelector(".work-container");
      if (!boxes.length || !container) return;
      const rectLeft = container.getBoundingClientRect().left;
      const rect = boxes[0].getBoundingClientRect();
      const parentWidth = boxes[0].parentElement?.getBoundingClientRect().width ?? 0;
      const padding = parseInt(window.getComputedStyle(boxes[0]).padding) / 2;
      translateX = Math.max(0, rect.width * boxes.length - (rectLeft + parentWidth) + padding);
    };

    measure();
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: () => `+=${translateX}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        id: "work",
        invalidateOnRefresh: true
      }
    });

    timeline.to(".work-flex", { x: () => -translateX, ease: "none" });
    const handleResize = () => {
      measure();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", handleResize);
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);

  useEffect(() => {
    if (!selectedArtwork) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedArtwork(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedArtwork]);

  return (
    <>
      <div className="work-section" id="art">
        <div className="work-container section-container">
          <div className="work-heading">
            <h2>Graphite <span>Art</span></h2>
            <p className="work-intro">{artworkIntro}</p>
          </div>
          <div className="work-flex">
            {artworks.map((artwork, index) => (
              <article className="work-box floating-bubble-card" key={artwork.id}>
                <div className="work-info">
                  <div className="work-title">
                    <h3>0{index + 1}</h3>
                    <div>
                      <h4>{artwork.title}</h4>
                      <p>Realistic graphite portrait</p>
                    </div>
                  </div>
                  <h4>Medium</h4>
                  <p>{artwork.medium}</p>
                  <h4 className="art-time-label">Approximate completion time</h4>
                  <p>{artwork.completionTime}</p>
                </div>
                {artwork.available ? (
                  <button className="artwork-preview" type="button" onClick={() => setSelectedArtwork(artwork)} aria-label={`View ${artwork.title} full screen`}>
                    <img src={artwork.image} alt={artwork.alt} loading="lazy" />
                  </button>
                ) : (
                  <div className="artwork-placeholder" role="img" aria-label={`${artwork.title}; original image pending`}>
                    <span>Original artwork image</span>
                    <strong>To be added</strong>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      {selectedArtwork && (
        <div className="artwork-lightbox" role="presentation" onMouseDown={() => setSelectedArtwork(null)}>
          <button type="button" onClick={() => setSelectedArtwork(null)} aria-label="Close artwork viewer">×</button>
          <img src={selectedArtwork.image} alt={selectedArtwork.alt} onMouseDown={(event) => event.stopPropagation()} />
          <p>{selectedArtwork.title} · {selectedArtwork.medium}</p>
        </div>
      )}
    </>
  );
};

export default GraphiteArt;

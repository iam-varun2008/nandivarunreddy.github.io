import "./styles/Career.css";
import "./styles/FloatingBubbleCard.css";
import { certifications } from "../data/certifications";
import { resolvePublicAsset } from "../utils/resolvePublicAsset";
import GlassOrbs from "./GlassOrbs";

const Career = () => {
  return (
    <div className="career-section section-container" id="certifications">
      <div className="career-container">
        <h2>
          My <span>certifications</span>
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {certifications.map((certificate) => (
            <div key={certificate.title} className="career-info-box floating-glass-card">
              <GlassOrbs />
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{certificate.title}</h4>
                  <h5>{certificate.issuer}</h5>
                </div>
                <h3>{certificate.shortLabel}</h3>
              </div>
              <div className="certificate-details">
                <p>{certificate.details}</p>
                {certificate.finalProject && <p><strong>Final project:</strong> {certificate.finalProject}</p>}
                <a href={resolvePublicAsset(certificate.certificateUrl)} target="_blank" rel="noopener noreferrer" data-cursor="disable">View certificate</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;

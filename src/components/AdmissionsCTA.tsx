import { profile as config } from "../data/profile";
import "./styles/CallToAction.css";

const AdmissionsCTA = () => {
  return (
    <div className="cta-section">
      <div className="cta-buttons">
        <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="cta-btn cta-btn-play" data-cursor="disable">
          View GitHub →
        </a>
        <a href={`mailto:${config.contact.email}`} className="cta-btn cta-btn-hire" data-cursor="disable">
          Email Me →
        </a>
      </div>
    </div>
  );
};

export default AdmissionsCTA;

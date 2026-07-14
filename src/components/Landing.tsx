import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { profile as config } from "../data/profile";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          <div className="landing-info">
            <div className="landing-role-block">
              <h3 className="landing-role-label">I AM A</h3>
              <h2 className="landing-info-h2" aria-label="Cybersecurity enthusiast">
                <span>CYBERSECURITY</span>
                <span>ENTHUSIAST</span>
              </h2>
              <p className="landing-supporting-line">
                Python Developer <span aria-hidden="true">·</span> Aspiring Ethical Hacker
              </p>
            </div>
            <p className="landing-summary">{config.developer.description}</p>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;

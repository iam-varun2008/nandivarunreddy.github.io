import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDid from "./WhatIDid";
import GraphiteArt from "./GraphiteArt";
import SkillsGoals from "./SkillsGoals";
import AdmissionsCTA from "./AdmissionsCTA";
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  useEffect(() => {
    let splitCleanup = setSplitText();
    let resizeTimer: number | undefined;
    let splitBreakpoint = window.innerWidth >= 900;
    const resizeHandler = () => {
      setIsDesktopView(window.innerWidth > 1024);
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const nextSplitBreakpoint = window.innerWidth >= 900;
        if (nextSplitBreakpoint !== splitBreakpoint) {
          splitBreakpoint = nextSplitBreakpoint;
          splitCleanup();
          splitCleanup = setSplitText();
        }
      }, 180);
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", resizeHandler);
      splitCleanup();
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div className="container-main">
        <Landing />
        <About />
        <WhatIDid />
        <Career />
        <GraphiteArt />
        <SkillsGoals />
        <AdmissionsCTA />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;

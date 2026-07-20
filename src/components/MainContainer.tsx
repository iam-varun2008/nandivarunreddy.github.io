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
  const [isDesktopView, setIsDesktopView] = useState(
    () => window.matchMedia("(min-width: 1025px)").matches
  );

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1025px)");
    const splitQuery = window.matchMedia("(min-width: 900px)");
    let splitCleanup = setSplitText();
    let splitTimer: number | undefined;

    const onDesktopChange = (event: MediaQueryListEvent) => {
      setIsDesktopView(event.matches);
    };
    const onSplitChange = () => {
      window.clearTimeout(splitTimer);
      splitTimer = window.setTimeout(() => {
        splitCleanup();
        splitCleanup = setSplitText();
      }, 100);
    };

    desktopQuery.addEventListener("change", onDesktopChange);
    splitQuery.addEventListener("change", onSplitChange);

    return () => {
      window.clearTimeout(splitTimer);
      desktopQuery.removeEventListener("change", onDesktopChange);
      splitQuery.removeEventListener("change", onSplitChange);
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

/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const finishStartedRef = useRef(false);
  const exitTimerRef = useRef<number | undefined>(undefined);

  const finishLoading = useCallback(() => {
    if (finishStartedRef.current) return;
    finishStartedRef.current = true;
    setClicked(true);

    exitTimerRef.current = window.setTimeout(() => {
      const revealPortfolio = () => {
        document.documentElement.dataset.loaderComplete = "true";
        window.dispatchEvent(new Event("portfolio:loader-complete"));
        setIsLoading(false);
      };

      import("./utils/initialFX")
        .then((module) => module.initialFX?.())
        .catch(() => undefined)
        .finally(revealPortfolio);
    }, 650);
  }, [setIsLoading]);

  useEffect(() => {
    if (percent < 100) return;
    const loadedTimer = window.setTimeout(() => {
      setLoaded(true);
    }, 80);
    const completeTimer = window.setTimeout(finishLoading, 300);

    return () => {
      window.clearTimeout(loadedTimer);
      window.clearTimeout(completeTimer);
    };
  }, [finishLoading, percent]);

  useEffect(() => {
    const maximumLoadingTimer = window.setTimeout(() => {
      setLoaded(true);
      finishLoading();
    }, 2500);

    return () => {
      window.clearTimeout(maximumLoadingTimer);
      window.clearTimeout(exitTimerRef.current);
    };
  }, [finishLoading]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          Varun Reddy
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span>&nbsp; Cybersecurity Enthusiast &nbsp;</span> <span>&nbsp; Python Developer &nbsp;</span>
            <span>&nbsp; Aspiring Ethical Hacker &nbsp;</span> <span>&nbsp; Computer Science Applicant &nbsp;</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;
  let disposed = false;

  let interval = setInterval(() => {
    if (disposed) return;
    if (percent <= 50) {
      const rand = Math.round(Math.random() * 5);
      percent = percent + rand;
      setLoading(percent);
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        percent = percent + Math.round(Math.random());
        setLoading(percent);
        if (percent > 91) {
          clearInterval(interval);
        }
      }, 200);
    }
  }, 100);

  function clear() {
    clearInterval(interval);
    if (!disposed) setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (disposed) {
          clearInterval(interval);
          return;
        }
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          resolve(percent);
          clearInterval(interval);
        }
      }, 2);
    });
  }
  function dispose() {
    disposed = true;
    clearInterval(interval);
  }
  return { loaded, clear, dispose };
};

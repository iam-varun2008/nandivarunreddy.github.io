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
        <a href={`${import.meta.env.BASE_URL}#`} className="loader-title" data-cursor="disable">
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
  let percent = 0;
  let disposed = false;
  let interval: number | undefined;
  let animationFrame: number | undefined;

  const stopTimers = () => {
    window.clearInterval(interval);
    window.cancelAnimationFrame(animationFrame ?? 0);
  };

  interval = window.setInterval(() => {
    if (disposed) return;

    if (percent <= 50) {
      percent = Math.min(percent + Math.round(Math.random() * 5), 55);
      setLoading(percent);
      return;
    }

    window.clearInterval(interval);
    interval = window.setInterval(() => {
      if (disposed) return;
      percent = Math.min(percent + Math.round(Math.random()), 92);
      setLoading(percent);
      if (percent >= 92) window.clearInterval(interval);
    }, 200);
  }, 100);

  const clear = () => {
    stopTimers();
    if (!disposed) {
      percent = 100;
      setLoading(100);
    }
  };

  const loaded = () =>
    new Promise<number>((resolve) => {
      window.clearInterval(interval);
      const startPercent = Math.min(percent, 99);
      const startTime = performance.now();
      const duration = Math.max((100 - startPercent) * 18, 140);

      const update = (time: number) => {
        if (disposed) return;
        const progress = Math.min((time - startTime) / duration, 1);
        const nextPercent = Math.min(
          100,
          Math.floor(startPercent + (100 - startPercent) * progress)
        );

        if (nextPercent !== percent) {
          percent = nextPercent;
          setLoading(percent);
        }

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(update);
        } else {
          resolve(100);
        }
      };

      animationFrame = window.requestAnimationFrame(update);
    });

  const dispose = () => {
    disposed = true;
    stopTimers();
  };

  return { loaded, clear, dispose };
};

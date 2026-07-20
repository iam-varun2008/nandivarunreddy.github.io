import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Cursor.css";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!cursor || !finePointer.matches) return;

    let hover = false;
    let animationFrameId = 0;
    const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursorPos = { ...mousePos };
    const setX = gsap.quickSetter(cursor, "x", "px") as (value: number) => void;
    const setY = gsap.quickSetter(cursor, "y", "px") as (value: number) => void;

    const onMouseMove = (event: MouseEvent) => {
      mousePos.x = event.clientX;
      mousePos.y = event.clientY;
    };

    const loop = () => {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        setX(cursorPos.x);
        setY(cursorPos.y);
      }
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const cursorElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cursor]")
    );
    const cleanupCallbacks: Array<() => void> = [];

    cursorElements.forEach((element) => {
      const onMouseOver = (event: MouseEvent) => {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          cursorPos.x = rect.left;
          cursorPos.y = rect.top;
          setX(cursorPos.x);
          setY(cursorPos.y);
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }

        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };

      const onMouseOut = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      };

      element.addEventListener("mouseover", onMouseOver);
      element.addEventListener("mouseout", onMouseOut);
      cleanupCallbacks.push(() => {
        element.removeEventListener("mouseover", onMouseOver);
        element.removeEventListener("mouseout", onMouseOut);
      });
    });

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    animationFrameId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      document.removeEventListener("mousemove", onMouseMove);
      cleanupCallbacks.forEach((cleanup) => cleanup());
      gsap.killTweensOf(cursor);
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;

// src/CrosshairOverlay.jsx
import { useEffect, useState, useRef } from "react";

/**
 * CrosshairOverlay
 * - Shows a small crosshair HUD.
 * - If the page has pointer lock active -> crosshair is centered.
 * - Otherwise the crosshair follows the mouse position.
 *
 * Props:
 * - size (px), color (CSS), styleType: "dot" | "plus"
 */
export default function CrosshairOverlay({
  size = 12,
  color = "rgba(255,255,255,0.95)",
  styleType = "dot",
}) {
  const [locked, setLocked] = useState(!!document.pointerLockElement);
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    // handlers - keep references so we can remove them cleanly
    const onPointerLockChange = () => {
      const isLocked = !!document.pointerLockElement;
      setLocked(isLocked);
      // center crosshair immediately when locking
      if (isLocked) {
        posRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      }
    };

    const onMouseMove = (e) => {
      // If pointer lock is active, the browser supplies movementX/movementY
      // and absolute client coords are not useful — keep center in that case.
      if (document.pointerLockElement) return;
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onResize = () => {
      // keep crosshair benignly centered on resize if locked, otherwise keep relative position
      if (document.pointerLockElement) posRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };

    document.addEventListener("pointerlockchange", onPointerLockChange);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Force a rerender at an interval so the crosshair follows smoothly
  // (we don't want to set state on every mousemove for perf reasons).
  const [, setTick] = useState(0);
  useEffect(() => {
    let raf = null;
    const loop = () => {
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Compute style from the current reference
  const left = locked ? "50%" : `${posRef.current.x}px`;
  const top = locked ? "50%" : `${posRef.current.y}px`;
  const transform = locked ? "translate(-50%,-50%)" : "translate(-50%,-50%)";

  // crosshair inner styles
  const baseStyle = {
    position: "absolute",
    left,
    top,
    transform,
    pointerEvents: "none", // important so it doesn't block canvas events
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const dotStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    background: color,
    border: "1px solid rgba(0,0,0,0.25)",
  };

  const plusStyle = {
    width: `${size * 2}px`,
    height: `${size * 2}px`,
    position: "relative",
  };

  const plusLineCommon = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    background: color,
  };

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }} aria-hidden>
      <div style={baseStyle}>
        {styleType === "dot" ? (
          <div style={dotStyle} />
        ) : (
          <div style={plusStyle}>
            <div style={{ ...plusLineCommon, width: `${size * 2}px`, height: `${Math.max(1, Math.round(size / 6))}px` }} />
            <div style={{ ...plusLineCommon, height: `${size * 2}px`, width: `${Math.max(1, Math.round(size / 6))}px` }} />
          </div>
        )}
      </div>
    </div>
  );
}


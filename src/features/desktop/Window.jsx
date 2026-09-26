import { useRef } from "react";
import { motion as Motion } from "motion/react";
import { useWM, APPS } from "./wmStore";

const MIN_W = 320;
const MIN_H = 180;

export default function Window({ win, rect, focused, children }) {
  const focus = useWM((s) => s.focus);
  const close = useWM((s) => s.close);
  const toggleFloat = useWM((s) => s.toggleFloat);
  const toggleMax = useWM((s) => s.toggleMax);
  const setGeom = useWM((s) => s.setGeom);
  const drag = useRef(null);

  const chrome = APPS[win.app]?.chrome ?? win.app;

  const onTitlePointerDown = (e) => {
    focus(win.id);
    if (!win.floating || win.maximized) return;
    if (e.target.closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode: "move", x: e.clientX, y: e.clientY, geom: { ...win.geom } };
  };

  const onHandlePointerDown = (e) => {
    e.stopPropagation();
    focus(win.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode: "resize", x: e.clientX, y: e.clientY, geom: { ...win.geom } };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.mode === "move") {
      setGeom(win.id, { x: d.geom.x + dx, y: d.geom.y + dy });
    } else {
      setGeom(win.id, {
        w: Math.max(MIN_W, d.geom.w + dx),
        h: Math.max(MIN_H, d.geom.h + dy),
      });
    }
  };

  const endDrag = (e) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <Motion.div
      className={`wm-win${focused ? " is-focused" : ""}${win.floating ? " is-floating" : ""}`}
      style={{ zIndex: win.maximized ? 40 : win.floating ? 30 : 10 }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: rect.x,
        y: rect.y,
        width: rect.w,
        height: rect.h,
      }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.7 }}
      onPointerDown={() => focus(win.id)}
    >
      <div
        className="wm-titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => toggleMax(win.id)}
      >
        <span className="wm-title">
          <span className="wm-title-chrome">{chrome}</span>
          <span className="wm-title-sep">·</span>
          {win.title}
        </span>
        <span className="wm-titlebar-actions">
          {win.floating && <span className="wm-badge">float</span>}
          <button
            type="button"
            className="wm-tb-btn"
            aria-label="Toggle floating"
            onClick={() => toggleFloat(win.id)}
          >
            ▢
          </button>
          <button
            type="button"
            className="wm-tb-btn"
            aria-label="Maximize"
            onClick={() => toggleMax(win.id)}
          >
            ▣
          </button>
          <button
            type="button"
            className="wm-tb-btn wm-tb-close"
            aria-label="Close window"
            onClick={() => close(win.id)}
          >
            ✕
          </button>
        </span>
      </div>

      <div className="wm-body">{children}</div>

      {win.floating && !win.maximized && (
        <div
          className="wm-resize"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      )}
    </Motion.div>
  );
}

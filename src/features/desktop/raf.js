// One requestAnimationFrame loop for the whole desktop.
//
// Every animated pane subscribes here instead of running its own rAF. That
// keeps a single callback on the scheduler no matter how many panes are open,
// lets each pane run at its own frame cap (cmatrix wants ~20fps, an aquarium
// ~10 — running either at 60 costs several times more and looks worse), and
// gives one place to stop everything when the tab is hidden.

const subs = new Set();
const fpsListeners = new Set();

let rafId = null;
let frames = 0;
let windowStart = 0;
let fps = 60;

function loop(now) {
  rafId = requestAnimationFrame(loop);

  frames += 1;
  if (!windowStart) {
    windowStart = now;
  } else if (now - windowStart >= 1000) {
    fps = Math.round((frames * 1000) / (now - windowStart));
    frames = 0;
    windowStart = now;
    fpsListeners.forEach((fn) => fn(fps));
  }

  for (const s of subs) {
    if (s.interval > 0 && now - s.last < s.interval) continue;
    s.last = now;
    try {
      s.draw(now);
    } catch {
      // A broken pane must not take the whole loop down with it.
    }
  }
}

function start() {
  if (rafId !== null || !subs.size) return;
  if (typeof document !== "undefined" && document.hidden) return;
  windowStart = 0;
  frames = 0;
  rafId = requestAnimationFrame(loop);
}

function stop() {
  if (rafId === null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}

// draw(now) is called at most `fpsCap` times a second. fpsCap 0 means "every
// frame". Returns an unsubscribe function.
export function subscribe(draw, fpsCap = 0) {
  const sub = { draw, interval: fpsCap > 0 ? 1000 / fpsCap : 0, last: 0 };
  subs.add(sub);
  start();
  return () => {
    subs.delete(sub);
    if (!subs.size) stop();
  };
}

export function onFps(cb) {
  fpsListeners.add(cb);
  return () => fpsListeners.delete(cb);
}

export function getFps() {
  return fps;
}

// Quality tiers. `dpr` is deliberately capped: these panes draw monospace
// glyphs, which gain nothing from a 2x backing store but cost 4x to fill.
export const QUALITY = {
  // `bloom` is a canvas shadowBlur radius. It is genuinely expensive per
  // glyph, so only the top tier pays for it; the automatic downgrade drops it
  // first if the frame rate sags.
  high: { matrixFps: 20, fishFps: 10, dpr: 1, density: 1, bloom: 5 },
  low: { matrixFps: 10, fishFps: 6, dpr: 1, density: 0.6, bloom: 0 },
  off: { matrixFps: 0, fishFps: 0, dpr: 1, density: 1, bloom: 0 },
};

export function canvasSize(canvas, host, dpr) {
  const w = Math.max(1, Math.floor(host.clientWidth));
  const h = Math.max(1, Math.floor(host.clientHeight));
  const scale = Math.min(dpr, window.devicePixelRatio || 1);
  if (canvas.width !== Math.floor(w * scale) || canvas.height !== Math.floor(h * scale)) {
    canvas.width = Math.floor(w * scale);
    canvas.height = Math.floor(h * scale);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
  return { w, h, scale };
}

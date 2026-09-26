import { useEffect, useRef } from "react";
import { useWM } from "../wmStore";
import { subscribe, QUALITY, canvasSize } from "../raf";

// Fish are drawn line by line, so each sprite is stored as its rows plus the
// mirrored rows for the other swim direction.
const FISH = [
  { r: ["   \\", "><_'>", "   /"], l: ["/   ", "<'_><", "\\   "], c: "#e8b04b" },
  { r: ["><(((º>"], l: ["<º)))><"], c: "#57d98a" },
  { r: ["  \\", ">=)'>", "  /"], l: ["/  ", "<'(=<", "\\  "], c: "#7aa2f7" },
  { r: ["><>"], l: ["<><"], c: "#bb9af7" },
  { r: [" _", "><_>"], l: ["_ ", "<_><"], c: "#7dcfff" },
];

const CELL_W = 7.2;
const CELL_H = 13;

function spawn(w, h, i) {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const kind = FISH[i % FISH.length];
  return {
    kind,
    dir,
    x: dir > 0 ? -Math.random() * w : w + Math.random() * w,
    y: 12 + Math.random() * Math.max(10, h - 48),
    speed: (0.25 + Math.random() * 0.55) * dir,
  };
}

export default function Asciiquarium() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const quality = useWM((s) => s.quality);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const q = QUALITY[quality] ?? QUALITY.high;
    let dims = { w: 0, h: 0, scale: 1 };
    let fish = [];
    let bubbles = [];
    let weeds = [];
    let t = 0;

    const layout = () => {
      dims = canvasSize(canvas, host, q.dpr);
      ctx.setTransform(dims.scale, 0, 0, dims.scale, 0, 0);
      ctx.font = `12px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";

      const count = Math.max(3, Math.round((dims.w / 150) * q.density));
      fish = Array.from({ length: count }, (_, i) => spawn(dims.w, dims.h, i));
      bubbles = Array.from({ length: Math.round(count * 1.5) }, () => ({
        x: Math.random() * dims.w,
        y: Math.random() * dims.h,
        s: 0.3 + Math.random() * 0.7,
      }));
      weeds = Array.from({ length: Math.max(3, Math.round(dims.w / 90)) }, (_, i) => ({
        x: 14 + i * 90 + Math.random() * 30,
        h: 3 + Math.round(Math.random() * 4),
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const frame = () => {
      t += 1;
      ctx.fillStyle = "#0b1114";
      ctx.fillRect(0, 0, dims.w, dims.h);

      // Seaweed, swaying on a sine so it costs one character per segment.
      ctx.fillStyle = "#2f7d55";
      for (const wd of weeds) {
        for (let s = 0; s < wd.h; s += 1) {
          const sway = Math.sin(t * 0.06 + wd.phase + s * 0.5) * 3;
          ctx.fillText(s % 2 ? ")" : "(", wd.x + sway, dims.h - (s + 1) * CELL_H - 4);
        }
      }

      ctx.fillStyle = "#3f6b7d";
      for (const b of bubbles) {
        ctx.fillText("°", b.x, b.y);
        b.y -= b.s;
        if (b.y < -CELL_H) {
          b.y = dims.h + Math.random() * 20;
          b.x = Math.random() * dims.w;
        }
      }

      for (const f of fish) {
        const rows = f.dir > 0 ? f.kind.r : f.kind.l;
        ctx.fillStyle = f.kind.c;
        for (let i = 0; i < rows.length; i += 1) {
          ctx.fillText(rows[i], f.x, f.y + i * CELL_H);
        }
        f.x += f.speed;
        const width = rows[0].length * CELL_W;
        if (f.speed > 0 && f.x > dims.w + width) {
          f.x = -width;
          f.y = 12 + Math.random() * Math.max(10, dims.h - 48);
        } else if (f.speed < 0 && f.x < -width) {
          f.x = dims.w + width;
          f.y = 12 + Math.random() * Math.max(10, dims.h - 48);
        }
      }

      // Waterline last so it sits above everything.
      ctx.fillStyle = "#3d6f86";
      let line = "";
      const chars = Math.ceil(dims.w / CELL_W);
      for (let i = 0; i < chars; i += 1) line += i % 4 < 2 ? "~" : "^";
      ctx.fillText(line, 0, 2);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    if (!q.fishFps) {
      frame();
      return () => ro.disconnect();
    }

    const unsub = subscribe(frame, q.fishFps);
    return () => {
      unsub();
      ro.disconnect();
    };
  }, [quality]);

  return (
    <div className="wm-canvas-host" ref={hostRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

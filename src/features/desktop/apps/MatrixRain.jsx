import { useEffect, useRef } from "react";
import { useWM } from "../wmStore";
import { subscribe, QUALITY, canvasSize } from "../raf";
import { phosphorOf } from "../phosphor";

// cmatrix draws a character grid, not a blurred trail: each column runs at its
// own speed with its own tail length, the leading cell is near-white, and
// characters already on screen keep mutating. Reproducing that needs a real
// per-column model rather than a translucent wash over the canvas.

// cmatrix -u territory: half-width katakana mixed with ASCII.
const GLYPHS =
  "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789:・.\"=*+-<>¦｜╌";

const CELL_W = 12;
const CELL_H = 14;

// The native green tube, used when no phosphor is selected.
const GREEN = { bg: "#070b09", dark: "#16663a", mid: "#33c46a", base: "#8ef0b0", bright: "#d6ffe4" };

const rand = (n) => Math.floor(Math.random() * n);
const glyph = () => GLYPHS[rand(GLYPHS.length)];

export default function MatrixRain() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const quality = useWM((s) => s.quality);
  const phosphorName = useWM((s) => s.phosphor);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const q = QUALITY[quality] ?? QUALITY.high;
    const p = phosphorOf(phosphorName) ?? GREEN;
    let dims = { w: 0, h: 0, scale: 1 };
    let cols = [];
    let rowCount = 0;

    const newColumn = (rowsHigh, seeded) => ({
      // Negative head keeps most columns off the top at the start so they
      // don't all arrive in one wave.
      head: seeded ? rand(rowsHigh) : -rand(rowsHigh),
      speed: 0.25 + Math.random() * 0.8,
      len: 6 + rand(Math.max(4, Math.min(22, rowsHigh - 2))),
      chars: Array.from({ length: rowsHigh + 2 }, glyph),
      acc: 0,
    });

    const layout = () => {
      dims = canvasSize(canvas, host, q.dpr);
      ctx.setTransform(dims.scale, 0, 0, dims.scale, 0, 0);
      ctx.font = `${CELL_H - 2}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      if (q.bloom) {
        ctx.shadowColor = p.glow ?? "rgba(80, 240, 140, 0.5)";
        ctx.shadowBlur = q.bloom;
      } else {
        ctx.shadowBlur = 0;
      }

      rowCount = Math.max(4, Math.floor(dims.h / CELL_H));
      const want = Math.max(1, Math.floor(dims.w / CELL_W));
      cols = Array.from({ length: want }, () => newColumn(rowCount, true));
    };

    const frame = () => {
      // Clear without a shadow, then switch it back on for the glyphs.
      ctx.shadowBlur = 0;
      ctx.fillStyle = p.bg;
      ctx.fillRect(0, 0, dims.w, dims.h);
      if (q.bloom) {
        ctx.shadowColor = p.glow ?? "rgba(80, 240, 140, 0.5)";
        ctx.shadowBlur = q.bloom;
      }

      for (let c = 0; c < cols.length; c += 1) {
        const col = cols[c];
        col.acc += col.speed;
        while (col.acc >= 1) {
          col.acc -= 1;
          col.head += 1;
          // Characters already on screen keep flickering.
          col.chars[((col.head % col.chars.length) + col.chars.length) % col.chars.length] = glyph();
        }

        const x = c * CELL_W;
        for (let i = 0; i < col.len; i += 1) {
          const row = Math.floor(col.head) - i;
          if (row < 0 || row >= rowCount) continue;
          const ch = col.chars[row % col.chars.length];

          if (i === 0) ctx.fillStyle = p.bright;
          else if (i === 1) ctx.fillStyle = p.base;
          else if (i < col.len * 0.45) ctx.fillStyle = p.mid;
          else ctx.fillStyle = p.dark;

          ctx.fillText(ch, x, row * CELL_H);
        }

        if (col.head - col.len > rowCount) cols[c] = newColumn(rowCount, false);
      }
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    if (!q.matrixFps) {
      frame();
      return () => ro.disconnect();
    }

    const unsub = subscribe(frame, q.matrixFps);
    return () => {
      unsub();
      ro.disconnect();
    };
  }, [quality, phosphorName]);

  return (
    <div className="wm-canvas-host" ref={hostRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useWM } from "../wmStore";
import { subscribe, QUALITY, canvasSize } from "../raf";
import { createAquarium } from "../aquarium/engine";
import { phosphorOf } from "../phosphor";

// Cell metrics for the monospace grid the sprites are authored against.
const FONT_PX = 11;
const CELL_H = 12;

export default function Asciiquarium() {
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
    const p = phosphorOf(phosphorName);
    let tank = null;
    let dims = { w: 0, h: 0, scale: 1 };
    let cellW = 6.6;

    const layout = () => {
      dims = canvasSize(canvas, host, q.dpr);
      ctx.setTransform(dims.scale, 0, 0, dims.scale, 0, 0);
      ctx.font = `${FONT_PX}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      cellW = ctx.measureText("M").width || 6.6;

      const cols = Math.max(20, Math.floor(dims.w / cellW));
      const rows = Math.max(10, Math.floor(dims.h / CELL_H));
      if (q.bloom) {
        ctx.shadowColor = p?.glow ?? "rgba(120, 200, 255, 0.35)";
        ctx.shadowBlur = q.bloom;
      } else {
        ctx.shadowBlur = 0;
      }
      tank = createAquarium({ cols, rows, density: q.density, phosphor: p });
    };

    const frame = () => {
      if (!tank) return;
      // Clear without a shadow, then switch it back on for the glyphs.
      ctx.shadowBlur = 0;
      ctx.fillStyle = p?.bg ?? "#06111a";
      ctx.fillRect(0, 0, dims.w, dims.h);
      if (q.bloom) {
        ctx.shadowColor = p?.glow ?? "rgba(120, 200, 255, 0.35)";
        ctx.shadowBlur = q.bloom;
      }
      tank.step();
      tank.draw(ctx, cellW, CELL_H);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    if (!q.fishFps) {
      // Settle the tank so a frozen frame still looks populated.
      for (let i = 0; i < 60; i += 1) tank.step();
      frame();
      return () => ro.disconnect();
    }

    const unsub = subscribe(frame, q.fishFps);
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

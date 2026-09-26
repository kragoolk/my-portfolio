import { useEffect, useRef } from "react";
import { useWM } from "../wmStore";
import { subscribe, QUALITY, canvasSize } from "../raf";
import { createAquarium } from "../aquarium/engine";

// Cell metrics for the monospace grid the sprites are authored against.
const FONT_PX = 11;
const CELL_H = 12;

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
      tank = createAquarium({ cols, rows, density: q.density });
    };

    const frame = () => {
      if (!tank) return;
      ctx.fillStyle = "#06111a";
      ctx.fillRect(0, 0, dims.w, dims.h);
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
  }, [quality]);

  return (
    <div className="wm-canvas-host" ref={hostRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useWM } from "../wmStore";
import { subscribe, QUALITY, canvasSize } from "../raf";

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789";
const CELL = 14;
const HEAD = "#9df5bd";
const BODY = "#57d98a";

export default function MatrixRain() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const quality = useWM((s) => s.quality);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const q = QUALITY[quality] ?? QUALITY.high;
    let drops = [];
    let cols = 0;
    let dims = { w: 0, h: 0, scale: 1 };

    const layout = () => {
      dims = canvasSize(canvas, host, q.dpr);
      ctx.setTransform(dims.scale, 0, 0, dims.scale, 0, 0);
      const next = Math.max(1, Math.floor(dims.w / CELL));
      if (next !== cols) {
        cols = next;
        drops = Array.from({ length: cols }, () => Math.random() * (dims.h / CELL));
      }
      ctx.fillStyle = "#0d0f11";
      ctx.fillRect(0, 0, dims.w, dims.h);
      ctx.font = `${CELL - 2}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
    };

    const frame = () => {
      // Translucent wash instead of a clear: this is what leaves the trails.
      ctx.fillStyle = "rgba(13, 15, 17, 0.09)";
      ctx.fillRect(0, 0, dims.w, dims.h);

      for (let i = 0; i < cols; i += 1) {
        const y = drops[i] * CELL;
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = HEAD;
        ctx.fillText(ch, i * CELL, y);
        // One dimmer glyph behind the head gives depth for one extra draw.
        ctx.fillStyle = BODY;
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * CELL, y - CELL);

        drops[i] += 1;
        if (y > dims.h && Math.random() > 0.975) drops[i] = 0;
      }
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    if (!q.matrixFps) {
      // Quality off: draw a single frame so the pane isn't blank, then idle.
      for (let i = 0; i < 30; i += 1) frame();
      return () => ro.disconnect();
    }

    const unsub = subscribe(frame, q.matrixFps);
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

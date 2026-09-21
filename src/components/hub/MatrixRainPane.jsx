import { useEffect, useRef } from "react";
import useInView from "../../lib/useInView";

const CHARS = "01アイウエオカキクケコサシスセソ$#%&*+=<>";

export default function MatrixRainPane() {
  const canvasRef = useRef(null);
  const [wrapperRef, inView] = useInView({ threshold: 0.01 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    const fontSize = 15;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let drops = [];
    let raf;

    const resize = () => {
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(3, 10, 4, 0.16)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px ${getComputedStyle(document.body).fontFamily}`;

      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        ctx.fillStyle = "#5dff8a";
        ctx.fillText(char, x, y * fontSize);
        if (y * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] = y + 1;
        }
      });

      raf = requestAnimationFrame(draw);
    };

    resize();

    // Always paint at least one frame immediately (not gated on inView),
    // so the pane is never blank while waiting on the observer — only the
    // continuous animation loop is gated on visibility / reduced motion.
    if (inView && !prefersReducedMotion) {
      raf = requestAnimationFrame(draw);
    } else {
      ctx.fillStyle = "#030a04";
      ctx.fillRect(0, 0, width, height);
      draw();
      cancelAnimationFrame(raf);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inView, wrapperRef]);

  return (
    <div className="wm-toy-canvas-wrap" ref={wrapperRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

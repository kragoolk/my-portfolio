import { useEffect, useRef } from "react";
import useInView from "../../lib/useInView";

const FISH_COLORS = ["#6fd6ff", "#4fb8e8", "#8fe3d0", "#5ec8f2", "#a8e6cf"];

function makeFish(width, height) {
  const dir = Math.random() > 0.5 ? 1 : -1;
  return {
    x: Math.random() * width,
    y: 30 + Math.random() * (height - 60),
    speed: (0.3 + Math.random() * 0.5) * dir,
    dir,
    size: 8 + Math.random() * 7,
    color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

function makeBubble(width, height) {
  return {
    x: Math.random() * width,
    y: height + Math.random() * 40,
    speed: 0.3 + Math.random() * 0.5,
    r: 1.5 + Math.random() * 2,
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

function drawFish(ctx, fish, t) {
  const { x, y, size, dir, color, wobblePhase } = fish;
  const bob = Math.sin(t * 2 + wobblePhase) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(dir, 1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  const tailWag = Math.sin(t * 6 + wobblePhase) * size * 0.25;
  ctx.moveTo(-size * 0.85, 0);
  ctx.lineTo(-size * 1.6, -size * 0.5 + tailWag);
  ctx.lineTo(-size * 1.6, size * 0.5 + tailWag);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#04202b";
  ctx.beginPath();
  ctx.arc(size * 0.55, -size * 0.1, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function AsciiquariumPane() {
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
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let fish = [];
    let bubbles = [];
    let raf;
    const start = performance.now();

    const resize = () => {
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fish = Array.from({ length: 6 }, () => makeFish(width, height));
      bubbles = Array.from({ length: 10 }, () => makeBubble(width, height));
    };

    const drawSeaweed = (t) => {
      const bladeCount = Math.max(3, Math.floor(width / 90));
      for (let i = 0; i < bladeCount; i++) {
        const bx = (i + 0.5) * (width / bladeCount);
        const segments = 6;
        const segH = 10;
        ctx.strokeStyle = "rgba(95, 200, 160, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, height);
        for (let s = 1; s <= segments; s++) {
          const sway = Math.sin(t * 1.2 + s * 0.6 + i) * (s * 1.6);
          ctx.lineTo(bx + sway, height - s * segH);
        }
        ctx.stroke();
      }
    };

    const draw = (now) => {
      const t = (now - start) / 1000;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#04141c");
      grad.addColorStop(1, "#071f2b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      drawSeaweed(t);

      bubbles.forEach((b) => {
        b.y -= b.speed;
        const wob = Math.sin(t * 2 + b.wobblePhase) * 3;
        if (b.y < -5) {
          b.y = height + Math.random() * 20;
          b.x = Math.random() * width;
        }
        ctx.strokeStyle = "rgba(180, 230, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x + wob, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      fish.forEach((f) => {
        f.x += f.speed;
        if (f.x < -20) f.x = width + 20;
        if (f.x > width + 20) f.x = -20;
        drawFish(ctx, f, t);
      });

      raf = requestAnimationFrame(draw);
    };

    resize();

    if (inView && !prefersReducedMotion) {
      raf = requestAnimationFrame(draw);
    } else {
      draw(start);
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

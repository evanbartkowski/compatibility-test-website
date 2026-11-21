"use client";

import { useRef, type RefObject } from "react";
import { useCanvasScene, type SceneDraw } from "./useCanvasScene";
export function LivingBackdrop({
  moving,
  pointer,
}: {
  moving: boolean;
  pointer: RefObject<{ x: number; y: number }>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw: SceneDraw = (ctx, width, height, time, palette) => {
    const drift = time * 0.08,
      px = pointer.current.x * 22,
      py = pointer.current.y * 16;
    for (let band = 0; band < 3; band++) {
      const x = width * (0.25 + band * 0.28) + Math.sin(drift + band) * 90 + px;
      const y =
        height * (0.18 + band * 0.28) + Math.cos(drift * 0.7 + band) * 70 + py;
      const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        Math.max(width * 0.4, 320),
      );
      glow.addColorStop(0, band === 1 ? palette.cyan : palette.plum);
      glow.addColorStop(1, "transparent");
      ctx.globalAlpha = palette.dark ? 0.085 : 0.055;
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.strokeStyle = palette.plum;
    for (let strand = 0; strand < 14; strand++) {
      ctx.globalAlpha = palette.dark ? 0.055 : 0.045;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let step = 0; step <= 70; step++) {
        const x = (width * step) / 70,
          y =
            height * 0.67 +
            Math.sin(step / 17 + drift + strand * 0.045) * height * 0.17 +
            strand * 12 +
            py;
        if (!step) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = palette.cyan;
    for (let i = 0; i < 48; i++) {
      const x =
        ((((i * 137.508 + Math.sin(drift + i) * 15) % width) + width) % width) +
        px * 0.3;
      const y =
        ((((i * 83.713 + Math.cos(drift * 0.8 + i) * 18) % height) + height) %
          height) +
        py * 0.3;
      ctx.globalAlpha =
        (palette.dark ? 0.2 : 0.15) + (Math.sin(time * 0.35 + i) + 1) * 0.08;
      ctx.beginPath();
      ctx.arc(x, y, i % 7 === 0 ? 1.8 : 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  useCanvasScene(canvas, draw, moving);
  return (
    <canvas
      ref={canvas}
      className="living-backdrop"
      aria-hidden="true"
      data-moving={moving}
    />
  );
}

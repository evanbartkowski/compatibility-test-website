"use client";

import { useRef, type RefObject } from "react";
import { useCanvasScene, type SceneDraw } from "./useCanvasScene";

export function LivingBackdrop({
  moving = true,
  pointer,
  className = "living-backdrop",
}: {
  moving?: boolean;
  pointer?: RefObject<{ x: number; y: number }>;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const draw: SceneDraw = (ctx, width, height, time, palette) => {
    const px = pointer?.current ? pointer.current.x * 35 : 0;
    const py = pointer?.current ? pointer.current.y * 25 : 0;

    // Erotic Color Orbs with Multi-Harmonic Pulses
    // 6 breathing erotic light bodies:
    // 1. Ruby / Passion Crimson
    // 2. Sensual Magenta / Violet
    // 3. SoulFlame Warm Amber / Gold
    // 4. Velvet Midnight Plum
    // 5. Electric Neon Rose
    // 6. Moonlit Cyan Shimmer
    const orbs = [
      {
        baseX: 0.22,
        baseY: 0.22,
        speedX: 0.09,
        speedY: 0.07,
        radiusMult: 0.48,
        pulseFreq: 0.85,
        colorInner: "rgba(225, 29, 72, 0.26)", // Crimson Passion
        colorMid: "rgba(190, 18, 60, 0.13)",
        colorOuter: "rgba(225, 29, 72, 0)",
      },
      {
        baseX: 0.78,
        baseY: 0.26,
        speedX: -0.08,
        speedY: 0.06,
        radiusMult: 0.44,
        pulseFreq: 0.72,
        colorInner: "rgba(192, 38, 211, 0.24)", // Sensual Magenta
        colorMid: "rgba(124, 58, 237, 0.11)",
        colorOuter: "rgba(192, 38, 211, 0)",
      },
      {
        baseX: 0.52,
        baseY: 0.56,
        speedX: 0.06,
        speedY: -0.09,
        radiusMult: 0.54,
        pulseFreq: 0.65,
        colorInner: "rgba(245, 158, 11, 0.20)", // Warm Ember Flame
        colorMid: "rgba(234, 88, 12, 0.09)",
        colorOuter: "rgba(245, 158, 11, 0)",
      },
      {
        baseX: 0.16,
        baseY: 0.76,
        speedX: 0.07,
        speedY: 0.05,
        radiusMult: 0.50,
        pulseFreq: 0.58,
        colorInner: "rgba(139, 92, 246, 0.22)", // Erotic Violet
        colorMid: "rgba(109, 40, 217, 0.10)",
        colorOuter: "rgba(139, 92, 246, 0)",
      },
      {
        baseX: 0.84,
        baseY: 0.74,
        speedX: -0.07,
        speedY: -0.08,
        radiusMult: 0.40,
        pulseFreq: 0.95,
        colorInner: "rgba(244, 63, 94, 0.24)", // Neon Rose
        colorMid: "rgba(225, 29, 72, 0.11)",
        colorOuter: "rgba(244, 63, 94, 0)",
      },
      {
        baseX: 0.48,
        baseY: 0.16,
        speedX: -0.05,
        speedY: 0.08,
        radiusMult: 0.36,
        pulseFreq: 0.80,
        colorInner: "rgba(6, 182, 212, 0.18)", // Electric Cyan
        colorMid: "rgba(14, 116, 144, 0.08)",
        colorOuter: "rgba(6, 182, 212, 0)",
      },
    ];

    // 1. Draw glowing background orbs
    for (let i = 0; i < orbs.length; i++) {
      const orb = orbs[i];
      const driftX = Math.sin(time * orb.speedX + i * 1.5) * (width * 0.14) + px;
      const driftY = Math.cos(time * orb.speedY + i * 1.8) * (height * 0.12) + py;
      const ox = width * orb.baseX + driftX;
      const oy = height * orb.baseY + driftY;

      // Pulse breathing amplitude
      const pulse = Math.sin(time * orb.pulseFreq + i) * 0.22 + 1.0;
      const r = Math.max(width * orb.radiusMult, 300) * pulse;

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      grad.addColorStop(0, orb.colorInner);
      grad.addColorStop(0.5, orb.colorMid);
      grad.addColorStop(1, orb.colorOuter);

      ctx.globalAlpha = palette.dark ? 1.0 : 0.65;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Silky undulating ribbons / sensual wave currents
    const waveCount = 7;
    for (let w = 0; w < waveCount; w++) {
      const waveY = height * 0.66 + w * 18 + py * 0.4;
      const waveAlpha = (palette.dark ? 0.08 : 0.04) + Math.sin(time * 0.5 + w) * 0.025;

      ctx.beginPath();
      for (let x = 0; x <= width; x += 16) {
        const y =
          waveY +
          Math.sin(x / 130 + time * 0.35 + w * 0.3) * 26 +
          Math.cos(x / 75 - time * 0.22 + w * 0.2) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle =
        w % 3 === 0
          ? "rgba(225, 29, 72, 0.45)"
          : w % 3 === 1
          ? "rgba(192, 38, 211, 0.45)"
          : "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = waveAlpha;
      ctx.stroke();
    }

    // 3. Erotic Embers / Floating Stardust drifting upward
    const emberCount = 56;
    for (let i = 0; i < emberCount; i++) {
      const emberTime = time * 0.28 + i * 39.3;
      const x = ((((i * 99.41 + Math.sin(emberTime * 0.65) * 40) % width) + width) % width) + px * 0.2;
      const y = ((((height - (emberTime * 26 + i * 41)) % height) + height) % height) + py * 0.2;

      const emberPulse = Math.sin(time * 1.1 + i * 2.3) * 0.5 + 0.5;
      const size = i % 6 === 0 ? 2.5 : i % 3 === 0 ? 1.6 : 1.0;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle =
        i % 4 === 0
          ? "rgba(245, 158, 11, 0.85)" // Gold Amber
          : i % 4 === 1
          ? "rgba(244, 63, 94, 0.85)" // Rose Crimson
          : i % 4 === 2
          ? "rgba(192, 38, 211, 0.85)" // Magenta Violet
          : "rgba(6, 182, 212, 0.75)"; // Cyan Moonlight

      ctx.globalAlpha = (palette.dark ? 0.28 : 0.16) + emberPulse * 0.35;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  useCanvasScene(canvas, draw, moving);

  return (
    <canvas
      ref={canvas}
      className={className}
      aria-hidden="true"
      data-moving={moving}
    />
  );
}

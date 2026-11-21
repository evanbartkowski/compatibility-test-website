"use client";

import { useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Hand,
  Pause,
  Play,
} from "lucide-react";
import { useCanvasScene, type SceneDraw } from "./useCanvasScene";

export interface ProfileExample {
  archetype: string;
  tagline: string;
  answered: number;
  dimensions: Array<{
    key: string;
    label: string;
    shortLabel?: string;
    score: number;
  }>;
}
const initialView = { yaw: -0.35, pitch: 0.22 };

export function HomeResultPreview({
  example,
  partner,
  moving = false,
  onMotionChange,
}: {
  example: ProfileExample;
  partner: ProfileExample;
  moving?: boolean;
  onMotionChange?: (moving: boolean) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    angles = useRef({ ...initialView });
  const previousTime = useRef(0);
  const drag = useRef<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
    id: number;
  } | null>(null);
  const [view, setView] = useState(initialView),
    [selected, setSelected] = useState(0),
    [comparison, setComparison] = useState(false);
  const [scores, setScores] = useState(example.dimensions.map((d) => d.score)),
    [localMoving, setLocalMoving] = useState(false);
  const enabled = onMotionChange ? moving : localMoving,
    hintId = useId();
  const rotate = (yaw: number, pitch: number) => {
    angles.current = { yaw, pitch: Math.max(-1.1, Math.min(1.1, pitch)) };
    setView({ ...angles.current });
  };
  const draw: SceneDraw = (ctx, width, height, time, palette) => {
    const radius = Math.min(width * 0.35, height * 0.37),
      cx = width / 2,
      cy = height / 2;
    if (enabled && !drag.current)
      angles.current.yaw +=
        Math.max(0, Math.min(time - previousTime.current, 0.05)) * 0.075;
    previousTime.current = time;
    const yaw = angles.current.yaw,
      pitch = angles.current.pitch;
    const project = (x: number, y: number, z: number) => {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw),
        rz = z * Math.cos(yaw) - x * Math.sin(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch),
        depth = rz * Math.cos(pitch) + y * Math.sin(pitch),
        perspective = 3.5 / (3.5 + depth);
      return {
        x: cx + rx * radius * perspective,
        y: cy + ry * radius * perspective,
        depth,
      };
    };
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.55);
    halo.addColorStop(0, palette.plum);
    halo.addColorStop(1, "transparent");
    ctx.globalAlpha = palette.dark ? 0.15 : 0.08;
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);
    const mesh = (values: number[], color: string, offset = 0) => {
      const sample = (theta: number, latitude: number) => {
        const segment =
          ((theta / (Math.PI * 2)) * values.length + values.length) %
          values.length;
        const index = Math.floor(segment),
          blend = (1 - Math.cos((segment - index) * Math.PI)) / 2;
        const score =
            values[index] * (1 - blend) +
            values[(index + 1) % values.length] * blend,
          r = 0.72 + score * 0.003 + offset;
        return project(
          Math.sin(theta) * Math.cos(latitude) * r,
          Math.sin(latitude) * r,
          Math.cos(theta) * Math.cos(latitude) * r,
        );
      };
      const trace = (
        points: Array<ReturnType<typeof project>>,
        emphasis = false,
      ) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = emphasis ? 1.8 : 0.75;
        for (let i = 1; i < points.length; i++) {
          ctx.globalAlpha = emphasis
            ? 0.9
            : Math.max(0.1, 0.45 - points[i].depth * 0.2);
          ctx.beginPath();
          ctx.moveTo(points[i - 1].x, points[i - 1].y);
          ctx.lineTo(points[i].x, points[i].y);
          ctx.stroke();
        }
      };
      for (let ring = -9; ring <= 9; ring++)
        trace(
          Array.from({ length: 81 }, (_, j) =>
            sample((j / 80) * Math.PI * 2, ring * 0.14),
          ),
          ring === 0,
        );
      for (let meridian = 0; meridian < 24; meridian++)
        trace(
          Array.from({ length: 45 }, (_, j) =>
            sample((meridian / 24) * Math.PI * 2, -1.5 + (j / 44) * 3),
          ),
        );
      values.forEach((_, index) => {
        const p = sample((index / values.length) * Math.PI * 2, 0);
        ctx.globalAlpha = Math.max(0.4, 0.9 - p.depth * 0.3);
        ctx.fillStyle = index === selected ? palette.cyan : color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, index === selected ? 5.5 : 3, 0, Math.PI * 2);
        ctx.fill();
        if (index === selected && !offset) {
          ctx.strokeStyle = palette.cyan;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };
    mesh(scores, palette.plum);
    if (comparison)
      mesh(
        partner.dimensions.map((d) => d.score),
        palette.cyan,
        0.045,
      );
    ctx.globalAlpha = 0.24;
    ctx.strokeStyle = palette.plum;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.27, radius * 0.28, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  useCanvasScene(canvas, draw, enabled);
  const d = example.dimensions[selected];
  return (
    <div className="profile-playground">
      <div className="orbit-topline">
        <h2 className="font-display">
          {comparison
            ? "Where two worlds meet."
            : "Your patterns, in perspective."}
        </h2>
        <div
          className="orbit-modes"
          role="group"
          aria-label="Explore result previews"
        >
          <button
            type="button"
            aria-pressed={!comparison}
            onClick={() => setComparison(false)}
          >
            Your profile
          </button>
          <button
            type="button"
            aria-pressed={comparison}
            onClick={() => setComparison(!comparison)}
          >
            {comparison ? "Hide partner" : "Compatibility"}
          </button>
        </div>
      </div>
      <div
        className="orbit-stage hero-radar-stage"
        role="group"
        tabIndex={0}
        aria-label="Rotate the example profile"
        aria-describedby={hintId}
        data-yaw={view.yaw.toFixed(2)}
        data-pitch={view.pitch.toFixed(2)}
        onKeyDown={(event) => {
          const offsets: Record<string, [number, number]> = {
            ArrowLeft: [-0.2, 0],
            ArrowRight: [0.2, 0],
            ArrowUp: [0, -0.15],
            ArrowDown: [0, 0.15],
          };
          if (event.key === "Home") {
            event.preventDefault();
            rotate(initialView.yaw, initialView.pitch);
          } else if (offsets[event.key]) {
            event.preventDefault();
            const [x, y] = offsets[event.key];
            rotate(angles.current.yaw + x, angles.current.pitch + y);
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            ...angles.current,
            id: event.pointerId,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          rotate(
            start.yaw + (event.clientX - start.x) * 0.009,
            start.pitch + (event.clientY - start.y) * 0.007,
          );
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <svg
          className="orbit-fallback"
          viewBox="0 0 400 350"
          aria-hidden="true"
        >
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <ellipse
              key={angle}
              cx="200"
              cy="175"
              rx="120"
              ry="54"
              transform={`rotate(${angle} 200 175)`}
              fill="none"
              stroke="var(--accent-plum)"
              opacity=".65"
            />
          ))}
        </svg>
        <span className="orbit-drag-hint" id={hintId}>
          <Hand size={14} aria-hidden="true" />
          Drag to spin · Arrow keys to rotate
        </span>
      </div>
      <div
        className="orbit-controls"
        role="group"
        aria-label="Profile illustration controls"
      >
        <div>
          <button
            type="button"
            onClick={() =>
              rotate(angles.current.yaw - 0.35, angles.current.pitch)
            }
            aria-label="Rotate left"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => rotate(initialView.yaw, initialView.pitch)}
            aria-label="Reset view"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              rotate(angles.current.yaw + 0.35, angles.current.pitch)
            }
            aria-label="Rotate right"
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <button
          type="button"
          aria-pressed={enabled}
          onClick={() =>
            onMotionChange ? onMotionChange(!enabled) : setLocalMoving(!enabled)
          }
        >
          {enabled ? <Pause size={14} /> : <Play size={14} />}
          {enabled ? "Pause motion" : "Turn motion on"}
        </button>
      </div>
      <div
        className="orbit-categories"
        role="group"
        aria-label="Inspect example categories"
      >
        {example.dimensions.map((dim, index) => (
          <button
            key={dim.key}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {dim.shortLabel || dim.label}
            <span>{scores[index]}%</span>
          </button>
        ))}
      </div>
      <label className="orbit-score-control">
        <span>
          Try a different {d.shortLabel?.toLowerCase() || d.label.toLowerCase()}{" "}
          score <output>{scores[selected]}%</output>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={scores[selected]}
          aria-label="Example category score"
          onChange={(event) =>
            setScores((values) =>
              values.map((value, index) =>
                index === selected ? Number(event.target.value) : value,
              ),
            )
          }
        />
      </label>
      <p className="orbit-example-note">
        An interactive example. Your private profile comes from your answers.
      </p>
    </div>
  );
}

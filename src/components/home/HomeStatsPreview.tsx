"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Hand,
  Pause,
  Play,
} from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import {
  buildHomeStats,
  EXAMPLE_STATS,
  EXAMPLE_COMPARISON,
  STAT_DIRECTIONS,
  STAT_EDGES,
  STAT_FACES,
  statVertices,
  projectStatVertex,
  type HomeStats,
  type Vec3,
} from "@/lib/assessment/home-stats";

const initialView = { yaw: Math.PI / 4, pitch: 0.615 };
const empty = buildHomeStats([]);
export function HomeStatsPreview({
  moving,
  onMotionChange,
}: {
  moving: boolean;
  onMotionChange: (value: boolean) => void;
}) {
  const auth = useOptionalAuth(),
    identity = auth.user?.uid || "guest";
  const [saved, setSaved] = useState<{
    identity: string;
    value: HomeStats;
  } | null>(null);
  const [status, setStatus] = useState("loading"),
    [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<"auto" | "example" | "personal">("auto");
  const [comparison, setComparison] = useState(true),
    [selected, setSelected] = useState(0);
  const [sampleScores, setSampleScores] = useState(
    EXAMPLE_STATS.axes.map((a) => a.score),
  );
  const [view, setView] = useState(initialView),
    angles = useRef(initialView);
  const stage = useRef<HTMLDivElement>(null),
    drag = useRef<{
      x: number;
      y: number;
      yaw: number;
      pitch: number;
      id: number;
    } | null>(null);
  const hint = useId(),
    graphTitle = useId(),
    graphDescription = useId();
  const rotate = (yaw: number, pitch: number) => {
    const next = { yaw, pitch: Math.max(-1.35, Math.min(1.35, pitch)) };
    angles.current = next;
    setView(next);
  };

  useEffect(() => {
    if (auth.loading || (auth.user && !auth.sessionReady)) return;
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/home-profile", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
      headers: { "x-profile-view": auth.user ? "account" : "guest" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Profile unavailable");
        const value: HomeStats = await response.json();
        if (!controller.signal.aborted) {
          setSaved({ identity, value });
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [identity, auth.loading, auth.sessionReady, auth.user, attempt]);

  useEffect(() => {
    const element = stage.current;
    if (!element || !moving) return;
    let frame = 0,
      visible = false,
      last = 0;
    const tick = (time: number) => {
      if (time - last >= 1000 / 30) {
        if (!drag.current)
          rotate(
            angles.current.yaw + Math.min(time - last, 50) * 0.00012,
            angles.current.pitch,
          );
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [moving]);

  const owned =
    !auth.loading &&
    (!auth.user || auth.sessionReady) &&
    saved?.identity === identity
      ? saved.value
      : empty;
  const personal =
    mode === "personal" || (mode === "auto" && owned.current.measured > 0);
  const profile = personal
    ? owned.current
    : {
        ...EXAMPLE_STATS,
        axes: EXAMPLE_STATS.axes.map((a, i) => ({
          ...a,
          score: sampleScores[i],
        })),
      };
  const partner = personal ? owned.previous : EXAMPLE_COMPARISON;
  const showComparison = comparison && partner !== null;
  const project = (v: Vec3) => {
    const p = projectStatVertex(v, view.yaw, view.pitch);
    return { x: 300 + p.x * 180, y: 230 + p.y * 180, depth: p.depth };
  };
  const frame = STAT_DIRECTIONS.map(project),
    vertices = statVertices(profile.axes.map((a) => a.score)).map(
      (v) => v && project(v),
    );
  const other = statVertices(partner?.axes.map((a) => a.score) || []).map(
    (v) => v && project(v),
  );
  const series = [
    { points: vertices, color: "var(--stat-self)", name: "current" },
    ...(showComparison
      ? [{ points: other, color: "var(--stat-other)", name: "comparison" }]
      : []),
  ];
  const faces = series
    .flatMap((s) =>
      STAT_FACES.filter((f) => f.every((i) => s.points[i] !== null)).map(
        (f) => ({
          ...s,
          indices: f,
          depth: f.reduce((sum, i) => sum + s.points[i]!.depth, 0) / 3,
        }),
      ),
    )
    .sort((a, b) => b.depth - a.depth);
  const finishDrag = () => {
    drag.current = null;
  };
  const active = profile.axes[selected];
  return (
    <div className="profile-playground stat-playground">
      <div className="orbit-topline">
        <div>
          <h2 className="font-display">
            {personal
              ? "Your profile, in 3D."
              : "See the shape of a connection."}
          </h2>
          <p className="stat-data-label">
            {personal
              ? `${profile.measured} of 6 axes measured`
              : "Example profiles · explore the graph"}
          </p>
        </div>
        <div
          className="orbit-modes"
          role="group"
          aria-label="Choose graph data"
        >
          <button
            type="button"
            aria-pressed={personal}
            onClick={() => setMode("personal")}
          >
            My stats
          </button>
          <button
            type="button"
            aria-pressed={!personal}
            onClick={() => setMode("example")}
          >
            Example
          </button>
        </div>
      </div>
      <div
        ref={stage}
        className="stat-stage"
        role="group"
        tabIndex={0}
        aria-label="Rotate 3D stats graph"
        aria-describedby={hint}
        data-yaw={view.yaw.toFixed(3)}
        data-pitch={view.pitch.toFixed(3)}
        data-personal={personal}
        onKeyDown={(e) => {
          const shifts: Record<string, [number, number]> = {
            ArrowLeft: [-0.2, 0],
            ArrowRight: [0.2, 0],
            ArrowUp: [0, -0.15],
            ArrowDown: [0, 0.15],
          };
          if (e.key === "Home") {
            e.preventDefault();
            rotate(initialView.yaw, initialView.pitch);
          } else if (shifts[e.key]) {
            e.preventDefault();
            const [x, y] = shifts[e.key];
            rotate(angles.current.yaw + x, angles.current.pitch + y);
          }
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            ...angles.current,
            id: e.pointerId,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.focus({ preventScroll: true });
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d?.id === e.pointerId)
            rotate(
              d.yaw + (e.clientX - d.x) * 0.009,
              d.pitch + (e.clientY - d.y) * 0.007,
            );
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
      >
        <svg
          viewBox="0 0 600 500"
          role="img"
          aria-labelledby={`${graphTitle} ${graphDescription}`}
          className="stat-space"
        >
          <title
            id={graphTitle}
          >{`${personal ? "Your measured profile" : "Example profile comparison"}: six-axis three-dimensional radar`}</title>
          <desc id={graphDescription}>
            Each axis runs from zero at the center to 100 at the outer grid. The
            colored vertices form a three-dimensional shape. An unmeasured axis
            is a gap. Drag or use arrow keys to rotate. Exact values and sources
            follow the graph.
          </desc>
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
            <g
              key={scale}
              className="stat-grid"
              opacity={scale === 1 ? 0.75 : 0.32}
            >
              {STAT_EDGES.map(([a, b]) => {
                const p = project(
                    STAT_DIRECTIONS[a].map((v) => v * scale) as unknown as Vec3,
                  ),
                  q = project(
                    STAT_DIRECTIONS[b].map((v) => v * scale) as unknown as Vec3,
                  );
                return (
                  <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
                );
              })}
            </g>
          ))}
          {frame.map((p, i) => (
            <line
              key={i}
              x1="300"
              y1="230"
              x2={p.x}
              y2={p.y}
              className="stat-spoke"
            />
          ))}
          <text x="307" y="246" className="stat-scale-label">
            0
          </text>
          {faces.map((f, i) => (
            <polygon
              key={`${f.name}-${i}`}
              data-series={f.name}
              points={f.indices
                .map((k) => `${f.points[k]!.x},${f.points[k]!.y}`)
                .join(" ")}
              fill={f.color}
              fillOpacity={f.depth > 0 ? 0.08 : 0.2}
              stroke={f.color}
              strokeWidth="1.6"
              strokeOpacity=".7"
            />
          ))}
          {series.map((s) => (
            <g key={s.name} data-profile={s.name}>
              {STAT_EDGES.filter(([a, b]) => s.points[a] && s.points[b]).map(
                ([a, b]) => (
                  <line
                    key={`${a}-${b}`}
                    x1={s.points[a]!.x}
                    y1={s.points[a]!.y}
                    x2={s.points[b]!.x}
                    y2={s.points[b]!.y}
                    stroke={s.color}
                    strokeWidth="2"
                    opacity=".85"
                  />
                ),
              )}
              {s.points.map(
                (p, i) =>
                  p && (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={selected === i ? 5 : 3.5}
                      fill={s.color}
                      stroke="var(--bg-canvas)"
                      strokeWidth="1.5"
                    />
                  ),
              )}
            </g>
          ))}
          {profile.axes.map((a, i) => {
            const p = project(
              STAT_DIRECTIONS[i].map((v) => v * 1.2) as unknown as Vec3,
            );
            return (
              <g
                key={a.key}
                className={`stat-axis-label ${selected === i ? "is-selected" : ""}`}
              >
                <text x={p.x} y={p.y - 3} textAnchor="middle">
                  {a.label}
                </text>
                <text
                  x={p.x}
                  y={p.y + 17}
                  textAnchor="middle"
                  className="stat-axis-value"
                >
                  {a.score === null ? "Unmeasured" : `${a.score} / 100`}
                </text>
              </g>
            );
          })}
        </svg>
        <span className="orbit-drag-hint" id={hint}>
          <Hand size={14} aria-hidden="true" /> Drag to spin · Arrow keys to
          rotate
        </span>
      </div>
      <div className="stat-legend">
        <span>
          <i className="stat-self-swatch" />
          {personal ? "You" : "Profile A"}
        </span>
        {showComparison && (
          <span>
            <i className="stat-other-swatch" />
            {personal ? "Before your latest retake" : "Profile B"}
          </span>
        )}
        <span className="stat-scale-note">0–100 · preferences, not grades</span>
      </div>
      <div
        className="orbit-controls"
        role="group"
        aria-label="Stats graph controls"
      >
        <div>
          <button
            type="button"
            aria-label="Rotate left"
            onClick={() =>
              rotate(angles.current.yaw - 0.35, angles.current.pitch)
            }
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Reset view"
            onClick={() => rotate(initialView.yaw, initialView.pitch)}
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            aria-label="Rotate right"
            onClick={() =>
              rotate(angles.current.yaw + 0.35, angles.current.pitch)
            }
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <button
          type="button"
          aria-pressed={moving}
          onClick={() => onMotionChange(!moving)}
        >
          {moving ? <Pause size={14} /> : <Play size={14} />}{" "}
          {moving ? "Pause motion" : "Turn motion on"}
        </button>
        {partner && (
          <button
            type="button"
            aria-pressed={showComparison}
            onClick={() => setComparison(!comparison)}
          >
            {showComparison ? "Hide comparison" : "Compare profiles"}
          </button>
        )}
      </div>
      <div
        className="stat-axis-buttons"
        role="group"
        aria-label="Inspect profile axes"
      >
        {profile.axes.map((a, i) => (
          <button
            type="button"
            key={a.key}
            aria-pressed={selected === i}
            aria-label={`${a.label}: ${a.score === null ? "unmeasured" : `${a.score} of 100`}${showComparison ? `; comparison ${partner!.axes[i].score === null ? "unmeasured" : `${partner!.axes[i].score} of 100`}` : ""}`}
            onClick={() => setSelected(i)}
          >
            <span>{a.label}</span>
            <strong>{a.score === null ? "—" : a.score}</strong>
            {showComparison && (
              <small>
                {partner!.axes[i].score === null ? "—" : partner!.axes[i].score}
              </small>
            )}
          </button>
        ))}
      </div>
      <div className="stat-axis-detail">
        <p>
          <strong>{active.label}.</strong> {active.description}
        </p>
        {personal ? (
          <p>
            {active.score === null ? (
              <Link href={`/assess/${active.slug}`}>
                Take the assessment to measure this axis
              </Link>
            ) : (
              <Link href={`/results/${active.sourceId}`}>
                {active.answered} answers · {active.measuredCategories} of{" "}
                {active.totalCategories} categories · View source
              </Link>
            )}
          </p>
        ) : (
          <label className="orbit-score-control">
            <span>
              Try a different score{" "}
              <output>{sampleScores[selected]} / 100</output>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={sampleScores[selected]!}
              aria-label="Example category score"
              onChange={(e) =>
                setSampleScores((values) =>
                  values.map((v, i) =>
                    i === selected ? Number(e.target.value) : v,
                  ),
                )
              }
            />
          </label>
        )}
      </div>
      {personal && !owned.previous && (
        <p className="orbit-example-note">
          Retake an assessment to compare with your earlier profile.{" "}
          <Link href="/couples">Compare with a partner</Link>.
        </p>
      )}
      {status === "error" && (
        <p className="stat-load-status" role="status">
          Your stats could not load.{" "}
          <button type="button" onClick={() => setAttempt((a) => a + 1)}>
            Try again
          </button>
        </p>
      )}
      {personal && auth.sessionError && (
        <p role="status" className="stat-load-status">
          Sign in again to load your account’s stats.
        </p>
      )}
    </div>
  );
}

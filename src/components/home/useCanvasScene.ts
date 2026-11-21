"use client";

import { useEffect, useRef, type RefObject } from "react";
export interface ScenePalette {
  plum: string;
  cyan: string;
  ink: string;
  dark: boolean;
}
export type SceneDraw = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  palette: ScenePalette,
) => void;

// Bounded resolution, 30fps, and no animation work offscreen or in hidden tabs.
export function useCanvasScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draw: SceneDraw,
  moving: boolean,
) {
  const drawRef = useRef(draw),
    redrawRef = useRef<(() => void) | null>(null),
    sceneTime = useRef(0);
  useEffect(() => {
    drawRef.current = draw;
    redrawRef.current?.();
  }, [draw]);
  useEffect(() => {
    const canvas = canvasRef.current,
      context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.dataset.ready = "true";
    let width = 0,
      height = 0,
      frame = 0,
      last = performance.now(),
      visible = true;
    let palette: ScenePalette;
    const colors = () => {
      const style = getComputedStyle(canvas);
      palette = {
        plum: style.getPropertyValue("--accent-plum").trim(),
        cyan: style.getPropertyValue("--accent-cyan").trim(),
        ink: style.getPropertyValue("--ink-secondary").trim(),
        dark: document.documentElement.dataset.theme !== "light",
      };
    };
    const paint = (time = sceneTime.current) => {
      if (width && height) {
        context.clearRect(0, 0, width, height);
        context.save();
        drawRef.current(context, width, height, time / 1000, palette);
        context.restore();
      }
    };
    const tick = (time: number) => {
      if (time - last >= 1000 / 30) {
        sceneTime.current += Math.min(time - last, 50);
        paint();
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      if (moving && visible && !document.hidden)
        frame = requestAnimationFrame(tick);
      else paint();
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };
    colors();
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      colors();
      paint();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", schedule);
    redrawRef.current = () => paint();
    resize();
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      themeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", schedule);
      redrawRef.current = null;
    };
  }, [canvasRef, moving]);
}

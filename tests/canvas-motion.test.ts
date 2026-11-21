// @vitest-environment jsdom
import React, { useRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useCanvasScene } from "@/components/home/useCanvasScene";

function Scene() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useCanvasScene(canvas, () => {}, true);
  return React.createElement("canvas", { ref: canvas });
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("does not schedule continuous canvas work when reduced motion is requested", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  const frames = vi.fn(() => 1);
  vi.stubGlobal("requestAnimationFrame", frames);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 400, height: 300 } as DOMRect);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ clearRect() {}, save() {}, restore() {}, setTransform() {} } as unknown as CanvasRenderingContext2D);
  render(React.createElement(Scene));
  expect(frames).not.toHaveBeenCalled();
});

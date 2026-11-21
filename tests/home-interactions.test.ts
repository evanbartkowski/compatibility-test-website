// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HomeStatsPreview } from "@/components/home/HomeStatsPreview";
import { SiteHeader } from "@/components/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  window.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("lets visitors rotate and reset the profile illustration with keyboard controls", () => {
  render(
    React.createElement(HomeStatsPreview, {
      moving: false,
      onMotionChange: vi.fn(),
    }),
  );
  const stage = screen.getByRole("group", {
    name: "Rotate 3D stats graph",
  });
  const initial = stage.getAttribute("data-yaw");
  fireEvent.keyDown(stage, { key: "ArrowRight" });
  expect(stage.getAttribute("data-yaw")).not.toBe(initial);
  fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
  expect(stage.getAttribute("data-yaw")).toBe(initial);
});

it("makes sign-in and account creation discoverable in the main header", () => {
  render(React.createElement(SiteHeader));
  expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
});

// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HomeResultPreview } from "@/components/home/HomeResultPreview";
import { SiteHeader } from "@/components/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
const example = {
  archetype: "An example",
  tagline: "A pattern",
  answered: 50,
  dimensions: ["Clarity", "Openness", "Presence", "Care", "Capacity"].map(
    (label, index) => ({ key: label, label, score: 40 + index * 10 }),
  ),
};
beforeEach(() => {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
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
});

it("lets visitors rotate and reset the profile illustration with keyboard controls", () => {
  render(React.createElement(HomeResultPreview, { example, partner: example }));
  const stage = screen.getByRole("group", {
    name: /Rotate the example profile/i,
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

// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccountPrivacyClient } from "@/components/settings/AccountPrivacyClient";

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
async function erase() {
  render(React.createElement(AccountPrivacyClient, {
    initialPrefs: { sessionKey: "guest", defaultCommunityOptIn: false, notifyNewTests: false, notifyPartnerReports: false, updatedAt: "" },
    initialSubmissionCount: 1, initialInvitationCount: 0,
  }));
  fireEvent.click(screen.getByRole("button", { name: "Erase results & drafts" }));
  fireEvent.click(await screen.findByRole("button", { name: /^Erase saved data$/ }));
}
it("does not claim server deletion succeeded when a static host sends HTML", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("<!doctype html>", { headers: { "Content-Type": "text/html" } })));
  localStorage.setItem("between_us_draft_test", "keep until deletion confirmed");
  await erase();
  await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/confirm|unavailable/i));
  expect(localStorage.getItem("between_us_draft_test")).not.toBeNull();
});
it("erases browser results, drafts, and population choices after confirmed deletion", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ deleted: true }), { headers: { "Content-Type": "application/json" } })));
  localStorage.setItem("between_us_guest_submissions", "[]");
  localStorage.setItem("between_us_submission_private", "private result");
  localStorage.setItem("between_us_draft_test", "draft");
  localStorage.setItem("between_us_population_views_v1", "{}");
  localStorage.setItem("between_us_theme", "dark");
  await erase();
  await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/erased/i));
  expect(localStorage.getItem("between_us_submission_private")).toBeNull();
  expect(localStorage.getItem("between_us_draft_test")).toBeNull();
  expect(localStorage.getItem("between_us_population_views_v1")).toBeNull();
  expect(localStorage.getItem("between_us_theme")).toBe("dark");
});

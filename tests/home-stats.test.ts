import { describe, expect, it } from "vitest";
import * as space from "@/lib/assessment/home-stats";

describe("Private profile space", () => {
  it("keeps unmeasured stats distinct from a measured zero", () => {
    expect(space.buildHomeStats).toBeTypeOf("function");
    const payload = space.buildHomeStats([
      {
        submissionId: "one",
        assessmentSlug: "erotic-blueprint-style",
        createdAt: "2026-11-21",
        result: {
          assessmentVersion: "3.0.0",
          radar: [
            { dimension: "kinky", label: "Kinky", score: 0, answeredCount: 2 },
          ],
        },
      },
    ]);
    expect(payload.current.axes.find((a) => a.key === "kink")?.score).toBe(0);
    expect(
      payload.current.axes.find((a) => a.key === "logical")?.score,
    ).toBeNull();
    expect(payload.current.axes).toHaveLength(6);
    expect(payload.previous).toBeNull();
  });
  it("compares the previous compatible attempt without averaging duplicates or versions", () => {
    expect(space.buildHomeStats).toBeTypeOf("function");
    const entry = (
      id: string,
      day: string,
      version: string,
      score: number,
    ) => ({
      submissionId: id,
      assessmentSlug: "erotic-blueprint-style",
      createdAt: day,
      result: {
        assessmentVersion: version,
        radar: [
          { dimension: "kinky", label: "Kinky", score, answeredCount: 2 },
        ],
      },
    });
    const payload = space.buildHomeStats([
      entry("old", "2026-11-18", "3.0.0", 20),
      entry("new", "2026-11-21", "3.0.0", 80),
      entry("other-version", "2026-11-20", "2.0.0", 100),
    ]);
    expect(payload.current.axes.find((a) => a.key === "kink")?.score).toBe(80);
    expect(payload.previous?.axes.find((a) => a.key === "kink")?.score).toBe(
      20,
    );
    expect(JSON.stringify(payload)).not.toContain("contributors");
  });
  it("projects actual 3D vertices and preserves an unknown axis as a gap", () => {
    expect(space.statVertices).toBeTypeOf("function");
    const vertices = space.statVertices([100, 50, 75, null, 0, 80]);
    expect(vertices[3]).toBeNull();
    expect(vertices[4]).toEqual([0, 0, 0]);
    expect(
      new Set(vertices.filter(Boolean).flatMap((v) => v!)).size,
    ).toBeGreaterThan(3);
    const initial = space.projectStatVertex([1, 0, 0], 0, 0);
    const rotated = space.projectStatVertex([1, 0, 0], Math.PI / 2, 0);
    expect(initial.x).not.toBeCloseTo(rotated.x);
    expect(initial.depth).not.toBeCloseTo(rotated.depth);
  });
  it("still finds the last retake when a different assessment was completed afterward", () => {
    const entry = (
      id: string,
      slug: string,
      day: string,
      dimension: string,
      score: number,
    ) => ({
      submissionId: id,
      assessmentSlug: slug,
      createdAt: day,
      result: {
        assessmentVersion: "3.0.0",
        radar: [{ dimension, label: dimension, score, answeredCount: 2 }],
      },
    });
    const result = space.buildHomeStats([
      entry("old", "erotic-blueprint-style", "2026-11-18", "kinky", 20),
      entry("retake", "erotic-blueprint-style", "2026-11-20", "kinky", 80),
      entry(
        "new-test",
        "big-five-personality-profile",
        "2026-11-21",
        "logical_reasoning",
        90,
      ),
    ]);
    expect(result.previous?.axes.find((a) => a.key === "kink")?.score).toBe(20);
    expect(
      result.previous?.axes.find((a) => a.key === "logical")?.score,
    ).toBeNull();
  });
});

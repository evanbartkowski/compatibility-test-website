import { describe, expect, it } from "vitest";
import { aggregateCloudSubmissions } from "../functions/src/community";
describe("Cloud aggregates contain measured, version-matched people only", () => {
  const record = (id: string, patch: Record<string, unknown> = {}) => ({
    ownerUid: id,
    assessmentSlug: "test",
    assessmentVersion: "2.0.0",
    mode: "quick",
    perspective: "primary",
    createdAt: "2026-11-20",
    consent: { optInCommunityStats: true },
    result: {
      scoringEngineVersion: "1.2.0",
      radar: [
        {
          dimension: "openness",
          label: "Openness",
          score: 80,
          answeredCount: 1,
        },
      ],
    },
    ...patch,
  });
  it("deduplicates before checking consent and suppresses undersized cohorts", () => {
    const items = Array.from({ length: 50 }, (_, i) => record(String(i)));
    expect(aggregateCloudSubmissions(items)[0].histogram.b8).toBe(50);
    expect(
      aggregateCloudSubmissions([
        ...items,
        record("0", {
          createdAt: "2026-11-21",
          consent: { optInCommunityStats: false },
        }),
      ]),
    ).toEqual([]);
  });
  it("separates versions, modes, engines and unmeasured dimensions", () => {
    const items = Array.from({ length: 49 }, (_, i) => record(String(i)));
    expect(
      aggregateCloudSubmissions([
        ...items,
        record("50", { assessmentVersion: "1.0.0" }),
      ]),
    ).toEqual([]);
    expect(
      aggregateCloudSubmissions([
        ...items,
        record("50", {
          result: {
            scoringEngineVersion: "1.2.0",
            radar: [
              {
                dimension: "openness",
                label: "Openness",
                score: 50,
                answeredCount: 0,
              },
            ],
          },
        }),
      ]),
    ).toEqual([]);
  });
});

// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AssessmentArtwork } from "@/components/assessment/AssessmentArtwork";
import { builtInAssessments } from "@/data/assessments/catalog";

describe("AssessmentArtwork", () => {
  it("gives repeated thumbnails independent gradient and filter targets", () => {
    const { container } = render(React.createElement("div", null,
      React.createElement(AssessmentArtwork, { slug: "bdsm-power-dynamics-test" }),
      React.createElement(AssessmentArtwork, { slug: "bdsm-power-dynamics-test" }),
    ));
    const ids = Array.from(container.querySelectorAll("[id]")).map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const svg of container.querySelectorAll("svg")) {
      for (const node of svg.querySelectorAll("[fill], [stroke], [filter]")) {
        for (const attr of ["fill", "stroke", "filter"]) {
          const target = node.getAttribute(attr)?.match(/^url\(#(.+)\)$/)?.[1];
          if (target) expect(Array.from(svg.querySelectorAll("[id]")).some(element => element.id === target)).toBe(true);
        }
      }
    }
  });
  it("renders distinct thematic artwork for all active assessments", () => {
    expect(builtInAssessments).toHaveLength(16);

    const renderedArtworks = new Set<string>();

    for (const assessment of builtInAssessments) {
      const { container } = render(
        React.createElement(AssessmentArtwork, {
          slug: assessment.slug,
          category: assessment.category,
        }),
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("viewBox")).toBe("0 0 240 120");

      // Verify each assessment has unique scoped identifiers and distinct SVG content
      const innerHtml = container.innerHTML;
      expect(innerHtml).toContain(`sf-art-${assessment.slug}`);
      renderedArtworks.add(innerHtml);
    }

    // Every one of the 20 assessments must produce unique artwork content
    expect(renderedArtworks.size).toBe(builtInAssessments.length);
  });

  it("renders banner variant with wide viewBox for assessment consent header", () => {
    const { container } = render(
      React.createElement(AssessmentArtwork, {
        slug: "bdsm-power-dynamics-test",
        variant: "banner",
      }),
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 360 120");
    expect(container.innerHTML).toContain("sf-art-bdsm-power-dynamics-test");
  });

  it("falls back gracefully for an unknown slug", () => {
    const { container } = render(
      React.createElement(AssessmentArtwork, {
        slug: "unknown-future-test",
      }),
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(container.innerHTML).toContain("sf-art-unknown-future-test");
  });
});

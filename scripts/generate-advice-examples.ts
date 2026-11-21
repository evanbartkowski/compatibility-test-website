import fs from "node:fs";
import path from "node:path";
import {
  builtInAssessments,
  getAssessmentBySlug,
} from "../src/data/assessments/catalog";
import { scoreAssessmentSubmission } from "../src/lib/assessment/scoring";
import { computeCoupleCompatibility } from "../src/lib/assessment/compatibility";
import type {
  AssessmentDefinition,
  QuestionAnswer,
  SharingPreferences,
} from "../src/lib/assessment/types";

const createdAt = "2026-11-20T00:00:00Z";
function example(
  name: string,
  slug: string,
  describe: string,
  answerFor: (
    q: AssessmentDefinition["questions"][number],
    i: number,
  ) => Partial<QuestionAnswer>,
) {
  const a = getAssessmentBySlug(slug)!;
  const answers = Object.fromEntries(
    a.questions.map((q, i) => [
      q.id,
      { questionId: q.id, updatedAt: createdAt, ...answerFor(q, i) },
    ]),
  );
  const result = scoreAssessmentSubmission({
    resultId: `fictional-${name}`,
    assessment: a,
    mode: "complete",
    perspective: "primary",
    createdAt,
    answers,
  });
  return {
    name,
    assessment: a.title,
    slug,
    fictional: true,
    describe,
    scores: result.radar.map((d) => ({
      category: d.label,
      score: d.score,
      rated: d.answeredCount,
    })),
    ranking: result.styleRanking,
    advice: result.advice,
  };
}

const examples = [
  example(
    "Avery",
    "erotic-blueprint-style",
    "Sensual leads at 100, Energetic is secondary at 75. Other styles are 25. Avery states willingness on wanted items and rates experience as Never. One high-interest item is always private and one is a hard limit.",
    (q, i) => ({
      enjoyment:
        q.sectionId === "sensual" ? 5 : q.sectionId === "energetic" ? 4 : 2,
      partnerWillingness: "enthusiastically_enjoy",
      experienceFrequency: 1,
      ...(i === 2 ? { revealRule: "private_never_share" } : {}),
      ...(i === 4 ? { firmBoundary: true } : {}),
    }),
  ),
  example(
    "Robin",
    "power-exchange-intensity",
    "Robin rates receiving guidance at 100 and offering it at 25 in the direction category; other categories are 0. The preference is paired with explicit willingness and low experience. Robin does not seek an identical receiving preference as a counterpart.",
    (q) => ({
      enjoyment:
        q.sectionId === "direction"
          ? q.intimacyRole === "receive"
            ? 5
            : 2
          : 1,
      partnerWillingness:
        q.sectionId === "direction"
          ? "willing_if_partner_enjoys"
          : "prefer_not_to",
      experienceFrequency: 1,
    }),
  ),
  example(
    "Jules",
    "aftercare-recovery-style",
    "Independent recovery space is 100 and all other care categories are 0. Jules has frequent experience of the wanted care and does not need an experience gap invented to receive useful advice.",
    (q) => ({
      enjoyment: q.sectionId === "space" ? 5 : 1,
      partnerWillingness:
        q.sectionId === "space" ? "enthusiastically_enjoy" : "prefer_not_to",
      experienceFrequency: 5,
    }),
  ),
];

const pairAssessment = getAssessmentBySlug("aftercare-recovery-style")!;
const receive = pairAssessment.questions.find(
  (q) => q.sectionId === "space" && q.intimacyRole === "receive",
)!;
const offer = pairAssessment.questions.find(
  (q) => q.id === receive.complementaryPartnerId,
)!;
const sharing: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: false,
  neverExposeRawPrivateAnswers: true,
};
const pair = computeCoupleCompatibility({
  compatibilityId: "fictional-mutual-care",
  inviteId: "fictional-invite",
  assessment: pairAssessment,
  mode: "complete",
  createdAt,
  creatorSharing: sharing,
  partnerSharing: sharing,
  primaryAnswers: {
    [receive.id]: {
      questionId: receive.id,
      enjoyment: 5,
      partnerWillingness: "enthusiastically_enjoy",
      updatedAt: createdAt,
    },
  },
  partnerAnswers: {
    [offer.id]: {
      questionId: offer.id,
      enjoyment: 2,
      partnerWillingness: "willing_if_partner_enjoys",
      updatedAt: createdAt,
    },
  },
});
const directory = path.resolve("docs");
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(
  path.join(directory, "ADVICE_EXAMPLES.json"),
  JSON.stringify(
    {
      note: "Fictional examples generated from the real scoring and advice engine. No saved user data is read.",
      examples,
      pair: {
        assessment: pair.assessmentTitle,
        disclosedTopicCount: pair.bothAnsweredCount,
        advice: pair.pairAdvice,
      },
    },
    null,
    2,
  ) + "\n",
);

const md = [
  "# Example results and personalized advice",
  "",
  "All three profiles below are fictional fixtures, generated from the real scorer. No user records, account data or private repository are read. Full structured output is in [ADVICE_EXAMPLES.json](ADVICE_EXAMPLES.json).",
  "",
  "Regenerate with `npx --yes tsx@4.20.6 scripts/generate-advice-examples.ts`.",
  "",
];
for (const e of examples) {
  const a = e.advice!;
  md.push(
    `## ${e.name}: ${e.assessment}`,
    "",
    e.describe,
    "",
    ...e.scores.map(
      (s) => `- ${s.category}: ${s.score}/100 from ${s.rated} ratings.`,
    ),
    "",
    `**Reading:** ${a.context}`,
    "",
    "### Who to look for",
    "",
    ...a.partnerTraits.flatMap((p) => [`**${p.title}.** ${p.body}`, ""]),
    "**Profile wording:**",
    "",
    `> ${a.partnerSearchLine}`,
    "",
    "### Potential friction",
    "",
    ...a.frictionPoints.flatMap((p) => [p.body, "", `> ${p.script}`, ""]),
    "### What to optimize",
    "",
    ...a.optimizations.flatMap((p) => [`**${p.title}.** ${p.body}`, ""]),
    "### Optional experiments, in preparation order",
    "",
  );
  a.experiments.forEach((x, i) =>
    md.push(
      `${i + 1}. **${x.title}** (${x.kind}; preparation level ${x.effort}). ${x.body}`,
      "",
      ...x.steps.map((step) => `   - ${step}`),
      "",
      `   **Stop:** ${x.stopRule}${x.aftercare ? ` **Care:** ${x.aftercare}` : ""}`,
      "",
    ),
  );
  md.push("### Desire versus experience", "", a.gapNote, "");
  if (!a.gaps.length)
    md.push(
      "No supported high-desire/low-experience gap is highlighted. There is no need to create one.",
      "",
    );
  for (const gap of a.gaps)
    md.push(
      `- **${gap.label}** Desire ${gap.desire}/100; experience ${gap.experience === null ? "unknown" : `${gap.experience}/100`}; path: ${gap.path}. ${gap.explanation}`,
      "",
    );
}
md.push(
  "## A mutually disclosed care example",
  "",
  "One person wants independent recovery time; the other explicitly offers the corresponding care despite rating their own desire lower. No other topics or experience values enter the pair advice.",
  "",
  ...pair.pairAdvice!.strengths.map((s) => `- **${s.title}** ${s.body}`),
  "",
  "**Potential friction is framed as a question, not a discovered defect:**",
  "",
  ...pair.pairAdvice!.frictionPoints.map((s) => s.body),
  "",
  ...pair.pairAdvice!.conversationStarters.map((s) => `> ${s}`),
  "",
  ...pair.pairAdvice!.experiments.flatMap((s) => [
    `**${s.title}**`,
    "",
    ...s.steps.map((step) => `- ${step}`),
    "",
    s.stopRule,
    "",
  ]),
  pair.pairAdvice!.privacyNote,
  "",
);
fs.writeFileSync(path.join(directory, "ADVICE_EXAMPLES.md"), md.join("\n"));

const overview = [
  "# Truth Desire: assessments and personalized advice",
  "",
  `${builtInAssessments.length} published assessments contain ${builtInAssessments.reduce((sum, a) => sum + a.questions.length, 0)} full-form questions. Every published test has an authored advice profile. The adult collection has ${builtInAssessments.filter((a) => a.collection).length} focused tests, each with a short and full form. Earlier versions remain available for saved results and invitations.`,
  "",
  "## Every test",
  "",
  "The hook, counts and advice topic below come directly from the registered TypeScript definitions. Advice is selected using the measured category, its interpretation, receiving/offering values and the item's actual desire, willingness, experience, privacy and limit fields.",
  "",
  "| Test and route | Hook | Teaser / deep | Advice focus |",
  "|---|---|---:|---|",
];
for (const a of builtInAssessments)
  overview.push(
    `| ${a.title} — \`${a.slug}\` | ${a.audienceNote.replaceAll("|", "/")} | ${a.supportsQuickMode === false ? "Full only" : a.questions.filter((q) => q.quickDiscovery).length} / ${a.questions.length} | ${a.adviceProfile!.theme}: ${a.adviceProfile!.optimize.replaceAll("|", "/")} |`,
  );
overview.push(
  "",
  "## What each guide includes",
  "",
  "- **Who to look for:** authored compatible traits, a role-counterpart question, constructive friction and editable dating/conversation wording. No partner is diagnosed or guaranteed compatible.",
  "- **What to optimize:** a category-specific habit and an explicit high/low contrast when supported. The five-style inventory also explains the secondary style.",
  "- **What to try:** three or four optional suggestions, ordered by preparation. Solo reflection, curiosity and a partner conversation or ordinary comfort prototype remain separate. A known eligible experience gap can add a fourth planning step. This order is not a medical or physical-risk certification.",
  "- **Desire–experience gaps:** up to five strongest supported gaps or missing-context rows, with separate paths for discussion, fantasy-only interest, hard limits, privacy and unknown context. No gap needs closing. Agreement-only core tests explicitly say they do not measure experience.",
  "- **Partner notes:** a separate pair guide uses only topics already mutually disclosed, never solo advice, rankings, gaps, hidden answers or a reason for nonmatching. Friction is a specific question to discuss, not a hidden mismatch claim.",
  "",
  "## Five-style ranking",
  "",
  "The original, non-graphic inventory describes Sensual (sensory atmosphere), Sexual (clear direct adult intimacy communication), Energetic (anticipation and unhurried transitions), Kinky (negotiated adult roles and symbolism) and Shapeshifter (explicit flexibility preferences). It does not reproduce another questionnaire or claim psychometric validation. All five styles need at least two rated items before naming primary and secondary. Exact leading ties remain ties; they are not reclassified as Shapeshifter. Teasers are provisional.",
  "",
  "## Evidence and eligibility",
  "",
  "Each advice block carries its source category, score and measured count; an item-specific step also identifies the eligible question. A private guide may explain its owner's hard-limit or private gap, but those topics cannot supply a partner experiment. Missing experience is never changed to Never; willingness never substitutes for desire. Low scores and lack of interest are valid preferences, not deficits to correct. If no category is measured, no partner type or experiment is fabricated.",
  "",
  "## Implementation",
  "",
  "- `src/data/assessments/advice-profiles.ts`: authored per-test coaching plus category-specific overrides.",
  "- `src/data/assessments/intimacy/erotic-blueprint.ts`: original five-style definition, registered in `intimacy/index.ts` and the main catalog.",
  "- `src/lib/assessment/advice.ts`: deterministic, separately versioned advice and ranking. Existing assessment scores and matching rubrics are unchanged.",
  "- `AdviceGuide.tsx`: keyboard-accessible advice sections, evidence disclosures, copyable wording and gap paths. `PairAdviceGuide.tsx` displays only mutually disclosed guidance.",
  "- Existing saved results receive missing advice in memory from their pinned definitions and existing scores, without rewriting their private file. Blueprint source notes remain owner-only.",
  "- Existing summary-export and public-share whitelists omit advice. A full private JSON export requires explicit answer and sensitive-data selections before it includes the private guide.",
  "",
  "## Examples and verification",
  "",
  "See [ADVICE_EXAMPLES.md](ADVICE_EXAMPLES.md) for three actual generated fictional profiles and one mutual-topic example, or [ADVICE_EXAMPLES.json](ADVICE_EXAMPLES.json) for structured output. See [../QUALITY_REPORT.md](../QUALITY_REPORT.md) for the executed test scope and limitations.",
  "",
);
fs.writeFileSync(
  path.join(directory, "ASSESSMENTS_AND_ADVICE.md"),
  overview.join("\n"),
);
console.log(
  "Generated docs/ASSESSMENTS_AND_ADVICE.md, docs/ADVICE_EXAMPLES.md and docs/ADVICE_EXAMPLES.json from the registered engine.",
);

import type {
  AssessmentDefinition,
  QuestionDefinition,
} from "@/lib/assessment/types";
import { withAdviceProfile } from "../advice-profiles";
import { candidCore } from "./legacy/core";
import { candidChoices } from "./legacy/choices";
import { desireSenseBanks } from "./legacy/desire-senses";
import { careConnectionBanks } from "./legacy/care-connection";
import { communicationRoleBanks } from "./legacy/communication-roles";
import { agreementBanks } from "./legacy/agreements";
import { fantasyBlueprintBanks } from "./legacy/fantasy-blueprint";

const banks = {
  ...desireSenseBanks,
  ...careConnectionBanks,
  ...communicationRoleBanks,
  ...agreementBanks,
  ...fantasyBlueprintBanks,
};

/** Frozen candid wording so saved 5.0.0 / 2.0.0 answers are never rescored against a later bank. */
export function publishLegacyCandid(
  previous: AssessmentDefinition,
): AssessmentDefinition {
  const a = structuredClone(withAdviceProfile(previous));
  const intimacy = a.collection === "intimacy-suite";
  a.version = intimacy ? "2.0.0" : "5.0.0";
  a.id = `${a.slug}-v${intimacy ? 2 : 5}`;
  a.editorialRevision = "candid-2026-11";
  a.futureExtensibilityNote =
    "Concrete authored situations with versioned question IDs. Revised questions never reinterpret earlier answers or combine their measurement cohorts.";
  if (!intimacy)
    a.scoringNotes = [
      a.scoringNotes![0],
      "The 10-question short form samples two statements per category. The full form has ten per category, including reverse wording. Skips stay unmeasured.",
      a.scoringNotes![2],
    ];
  let order = 0;
  a.questions = a.sections.flatMap((section) => {
    const prototype = previous.questions.find(
      (q) => q.sectionId === section.id,
    )!;
    if (!prototype)
      throw new Error(`Missing question prototype: ${a.slug}/${section.id}`);
    if (!intimacy) {
      const statements = candidCore[a.slug]?.[section.id];
      if (!statements)
        throw new Error(`Missing candid core: ${a.slug}/${section.id}`);
      return statements.map((statement, index): QuestionDefinition => {
        const prompt = statement.replace(/^!/, "");
        return {
          ...prototype,
          id: `rev5-${section.id}-${index + 1}`,
          order: ++order,
          prompt,
          partnerPrompt: prompt,
          helperText:
            "Choose how closely this describes you. Mixed answers and Skip are welcome.",
          quickDiscovery: index < 2,
          reverseScored: statement.startsWith("!"),
          dimensionWeights: { [section.id]: 1 },
          editorialNote:
            "Original concrete situation; reverse wording is scored in the stated dimension direction.",
        };
      });
    }
    if (a.slug === "spicy-would-you-rather") {
      return candidChoices[section.id].map(
        ([left, right], index): QuestionDefinition => ({
          ...prototype,
          id: `rev2-${section.id}-${index + 1}`,
          order: ++order,
          prompt: `Which appeals more: ${left.charAt(0).toLowerCase() + left.slice(1)}, or ${right.charAt(0).toLowerCase() + right.slice(1)}?`,
          partnerPrompt: `Which appeals more: ${left.charAt(0).toLowerCase() + left.slice(1)}, or ${right.charAt(0).toLowerCase() + right.slice(1)}?`,
          quickDiscovery: index < 2,
          helperText:
            "Choose the option that appeals more, then rate its appeal separately. Skip if neither fits.",
          options: [
            { label: left, value: "a", dimensionWeights: { [section.id]: 0 } },
            { label: right, value: "b", dimensionWeights: { [section.id]: 1 } },
          ],
          dimensionWeights: { [section.id]: 1 },
        }),
      );
    }
    const pairs = banks[a.slug]?.[section.id];
    if (!pairs)
      throw new Error(`Missing candid intimacy: ${a.slug}/${section.id}`);
    return pairs.flatMap((pair, index) =>
      (["receive", "offer"] as const).map(
        (role, side): QuestionDefinition => ({
          ...prototype,
          id: `rev2-${section.id}-${index + 1}-${role}`,
          order: ++order,
          prompt: pair[side],
          partnerPrompt: pair[side],
          helperText:
            "Rate this specific preference. Desire, willingness, experience and limits are separate choices.",
          quickDiscovery: index === 0,
          intimacyRole: role,
          directionality: role === "receive" ? "receive_give" : "give_receive",
          complementaryPartnerId: `rev2-${section.id}-${index + 1}-${role === "receive" ? "offer" : "receive"}`,
          topicTags: [a.slug, section.id, role],
          dimensionWeights: { [section.id]: 1 },
          editorialNote:
            "Original specific adult preference; receiving and offering are independent channels.",
        }),
      ),
    );
  });
  a.supportsQuickMode = true;
  a.sections = a.sections.map(({ id, title, subtitle, description }) => ({
    id,
    title,
    subtitle,
    description,
  }));
  const quick = a.questions.filter((q) => q.quickDiscovery).length;
  a.estimatedMinutesQuick = Math.ceil((quick * (intimacy ? 25 : 14)) / 60);
  a.estimatedMinutesComplete = Math.ceil(
    (a.questions.length * (intimacy ? 25 : 14)) / 60,
  );
  a.quickDescription = `${quick} questions sample every category.`;
  a.deepDescription = `${a.questions.length} distinct questions explore ${a.sections.map((s) => s.title.toLowerCase()).join(", ")}.`;
  if (a.slug === "fantasy-catalog") {
    a.audienceNote = a.purpose =
      "Discover which sexual and romantic fantasies spark your curiosity: 50 distinct themes, with receiving and offering rated separately.";
    a.marketingBlurb =
      "Find the fantasy behind the setting, the role and the attention you want.";
    const labels: Record<string, string> = {
      worlds: "Settings",
      characters: "Adult roles",
      narratives: "Buildup & story",
      attention: "Kinds of attention",
      choice: "Variety & choice",
    };
    for (const s of a.sections) s.title = labels[s.id];
    for (const q of a.questions) q.sectionTitle = labels[q.sectionId];
    for (const d of a.dimensions || []) d.label = labels[d.key];
    a.discoverPoints = Object.values(labels);
  }
  if (a.slug === "spicy-would-you-rather") {
    const d = a.dimensions?.find((item) => item.key === "roles");
    if (d) {
      d.label = "Fluid or assigned roles";
      d.lowLabel = "Fluid roles";
      d.highLabel = "Assigned roles";
      if (d.interpretations) {
        d.interpretations.low.meaning =
          "Your choices favor sharing initiative and changing roles as the date unfolds.";
        d.interpretations.high.meaning =
          "Your choices favor deciding who leads or follows for a particular part of a date.";
      }
    }
  }
  if (a.adviceProfile)
    a.adviceProfile = JSON.parse(
      JSON.stringify(a.adviceProfile)
        .replace(/private time/g, "sex")
        .replace(/intimate time/g, "sex"),
    );
  return a;
}

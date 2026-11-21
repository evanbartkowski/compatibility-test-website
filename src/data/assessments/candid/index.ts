import type {
  AssessmentDefinition,
  QuestionDefinition,
} from "@/lib/assessment/types";
import { withAdviceProfile } from "../advice-profiles";
import { candidCore } from "./core";
import { candidChoices } from "./choices";
import { desireSenseBanks } from "./desire-senses";
import { careConnectionBanks } from "./care-connection";
import { communicationRoleBanks } from "./communication-roles";
import { agreementBanks } from "./agreements";
import { fantasyBlueprintBanks } from "./fantasy-blueprint";
import { applyLiveVoice } from "./edge-copy";
import { bdsmBank } from "./bdsm-bank";
import { kinkBank } from "./kink-bank";

const banks = {
  ...desireSenseBanks,
  ...careConnectionBanks,
  ...communicationRoleBanks,
  ...agreementBanks,
  ...fantasyBlueprintBanks,
};

/** New wording changes measurement: fresh IDs and versions, never a rewrite of saved answers. */
export function publishCandidRevision(
  previous: AssessmentDefinition,
): AssessmentDefinition {
  const a = structuredClone(withAdviceProfile(previous));
  const intimacy = a.collection === "intimacy-suite";
  a.version = intimacy ? "3.0.0" : "6.0.0";
  a.id = `${a.slug}-v${intimacy ? 3 : 6}`;
  a.editorialRevision = "edge-2026-11";
  a.futureExtensibilityNote =
    "Concrete authored situations with versioned question IDs. Revised questions never reinterpret earlier answers or combine their measurement cohorts.";
  const revision = intimacy ? "rev3" : "rev6";
  let order = 0;
  a.questions = a.sections.flatMap((section) => {
    const prototype = previous.questions.find(
      (q) => q.sectionId === section.id,
    )!;
    if (!prototype)
      throw new Error(`Missing question prototype: ${a.slug}/${section.id}`);
    if (!intimacy && a.slug === "bdsm-power-dynamics-test") {
      const items = bdsmBank[section.id];
      if (!items) throw new Error(`Missing BDSM bank: ${section.id}`);
      return items.map((item, index): QuestionDefinition => ({
        ...prototype,
        id: `${revision}-${section.id}-${index + 1}`,
        order: ++order,
        prompt: item.text,
        partnerPrompt: item.text,
        helperText: "Rate how true this is. A high score is desire, not consent. Skip is a real answer.",
        quickDiscovery: index < 2,
        reverseScored: Boolean(item.reverse),
        dimensionWeights: { [section.id]: 1 },
        topicTags: (item.roles || []).map((role) => `role:${role}`),
        editorialNote: "First-person BDSM role item. Role tags drive the ranked percentages.",
      }));
    }
    if (!intimacy && a.slug === "sexual-interests-curiosity-map") {
      const items = kinkBank[section.id];
      if (!items) throw new Error(`Missing kink bank: ${section.id}`);
      return items.map((item, index): QuestionDefinition => ({
        ...prototype,
        id: `${revision}-${section.id}-${index + 1}`,
        order: ++order,
        prompt: item.text,
        partnerPrompt: item.text,
        helperText: "Rate how much you desire or get turned on by this. Skip is a valid answer.",
        quickDiscovery: index < 2,
        reverseScored: Boolean(item.reverse),
        dimensionWeights: { [section.id]: 1 },
        topicTags: (item.roles || []).map((role) => `role:${role}`),
        editorialNote: "Candid unfiltered kink item. Role tags drive the ranked kink percentages.",
      }));
    }
    if (!intimacy) {
      const statements = candidCore[a.slug]?.[section.id];
      if (!statements)
        throw new Error(`Missing candid core: ${a.slug}/${section.id}`);
      return statements.map((statement, index): QuestionDefinition => {
        const prompt = statement.replace(/^!/, "");
        return {
          ...prototype,
          id: `${revision}-${section.id}-${index + 1}`,
          order: ++order,
          prompt,
          partnerPrompt: prompt,
          helperText:
            "Rate how true this is. A high score is not a promise. Skip is a real answer.",
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
          id: `${revision}-${section.id}-${index + 1}`,
          order: ++order,
          prompt: `Which appeals to you more, ${left.charAt(0).toLowerCase() + left.slice(1)} or ${right.charAt(0).toLowerCase() + right.slice(1)}?`,
          partnerPrompt: `Which appeals to you more, ${left.charAt(0).toLowerCase() + left.slice(1)} or ${right.charAt(0).toLowerCase() + right.slice(1)}?`,
          quickDiscovery: index < 2,
          helperText:
            "Pick the option that pulls harder, then rate how much. Neither side is the good one. Skip if both are wrong.",
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
          id: `${revision}-${section.id}-${index + 1}-${role}`,
          order: ++order,
          prompt: pair[side],
          partnerPrompt: pair[side],
          helperText:
            "Rate the appeal. Desire, willingness, experience, and a hard limit are separate. Fantasy can score high while the real-world answer stays no.",
          quickDiscovery: index === 0,
          intimacyRole: role,
          directionality: role === "receive" ? "receive_give" : "give_receive",
          complementaryPartnerId: `${revision}-${section.id}-${index + 1}-${role === "receive" ? "offer" : "receive"}`,
          topicTags: [a.slug, section.id, role, `role:${section.id}`],
          dimensionWeights: { [section.id]: 1 },
          editorialNote:
            "Original specific adult preference; receiving and offering are independent channels.",
        }),
      ),
    );
  });
  a.supportsQuickMode = true;
  // Discard obsolete questionIds attached by an older binary-choice definition.
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
    const d = a.dimensions?.find((d) => d.key === "roles");
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
  if (!intimacy && a.scoringNotes) {
    const per = a.questions.filter((q) => q.sectionId === a.sections[0]?.id).length;
    a.scoringNotes = [
      a.scoringNotes[0],
      `The short form samples two statements per category. The full form has ${per} per category. ${a.questions.some((q) => q.reverseScored) ? "Reverse-worded statements are scored in the category direction." : "Interest statements are scored directly."} Skips stay unmeasured.`,
      a.scoringNotes[2],
    ];
  }
  if (a.adviceProfile)
    a.adviceProfile = JSON.parse(
      JSON.stringify(a.adviceProfile)
        .replace(/private time/g, "sex")
        .replace(/intimate time/g, "sex"),
    );
  applyLiveVoice(a);
  return a;
}

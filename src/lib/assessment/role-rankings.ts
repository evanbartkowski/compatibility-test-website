import type { AssessmentDefinition, QuestionAnswer, ScoredAssessmentResult } from "./types";

export interface RoleScore {
  key: string;
  label: string;
  group: string;
  percent: number;
  answeredCount: number;
  you: string;
  try: string[];
}

export interface RoleComparison {
  score: number;
  summary: string;
  complements: string[];
  shared: string[];
  friction: string[];
}

const copy = (
  label: string,
  group: string,
  you: string,
  tryItems: string[],
): Omit<RoleScore, "key" | "percent" | "answeredCount"> => ({
  label,
  group,
  you,
  try: tryItems,
});

export const ROLE_COPY: Record<string, Omit<RoleScore, "key" | "percent" | "answeredCount">> = {
  submissive: copy("Submissive", "Power exchange", "You want a partner to take the lead in sex and give you orders you can follow.", ["A scene where your partner picks the position and the pace", "Asking permission before you come", "Kneeling or waiting because you were told to"]),
  dominant: copy("Dominant", "Power exchange", "You enjoy taking control and directing what happens in the scene.", ["Ordering the next position and the pace", "Deciding when your partner may come", "A short scene you plan and then run"]),
  switch: copy("Switch", "Power exchange", "You want both sides. Leading one night and surrendering the next both fit.", ["Name who leads before the clothes come off", "Switch roles on the next date", "A scene that changes hands halfway through"]),
  vanilla: copy("Vanilla", "Sexual style", "You want sex and romance without a heavy kink structure.", ["A direct, affectionate fuck with no protocol", "Say which ordinary acts you actually want repeated", "Keep kink talk optional instead of required"]),
  master: copy("Master/Mistress", "Power exchange", "You want authority that lasts past one scene, and you are willing to carry that responsibility.", ["A title used only in the dynamic", "A written list of what you decide and what you do not", "A review every few weeks, not a permanent blank check"]),
  slave: copy("Slave", "Power exchange", "You want service and obedience to be a real part of the relationship, not a one-night costume.", ["A service task you can decline", "A 24/7 experiment with a clear end time", "Honorifics that come off when the dynamic ends"]),
  owner: copy("Owner", "Roleplay and identity", "You want to keep, train, or direct someone who has agreed to be yours in the scene.", ["Pet or service protocol with a stop", "Training a specific task, not a whole life", "A collar or title that is taken off afterward"]),
  pet: copy("Pet", "Roleplay and identity", "You want to be kept, petted, trained, or put in a pet role by a partner.", ["A collar and a few commands for one evening", "Eating, kneeling, or waiting as play, then stopping", "A non-sexual pet scene if the sex version is too much"]),
  rope_bunny: copy("Rope bunny", "Sensation and impact", "You want the sensation and helplessness of being tied.", ["Cuffs or a simple rope tie you can get out of", "Being immobilized while your partner stays in the room", "A tie that comes off the moment you say stop"]),
  rigger: copy("Rigger", "Sensation and impact", "You enjoy tying someone and the craft of the rope.", ["A simple chest or wrist tie on a willing partner", "Practicing a knot on yourself before you use it on them", "A scene that is about the tie, not only the sex"]),
  masochist: copy("Masochist", "Sensation and impact", "You want pain, marks, or fear inside limits you set.", ["A spanking that leaves a handprint", "Impact that stops when you say so", "Looking at the marks the next day"]),
  sadist: copy("Sadist", "Sensation and impact", "You enjoy giving pain or intensity and seeing the effect on a consenting partner.", ["A paddle or flogger on a partner who asked for it", "Watching a mark you both wanted", "Stopping the moment their stop word lands"]),
  degradee: copy("Degradee", "Roleplay and identity", "You want to be humiliated, named, or treated with less respect inside a scene.", ["A humiliating name you chose", "Being told you are a toy, then praised after", "A word that ends the degradation immediately"]),
  degrader: copy("Degrader", "Roleplay and identity", "You enjoy humiliating or verbally degrading a partner who wants that.", ["Names they picked, not ones you invent to hurt them", "Degradation that ends when the scene ends", "Aftercare that is sincere, not another insult"]),
  brat: copy("Brat", "Power exchange", "You like teasing, talking back, and making a dominant work for your obedience.", ["A negotiated brat scene with a consequence you chose", "Talking back until they decide to correct you", "A stop that is not part of the bratting"]),
  brat_tamer: copy("Brat tamer", "Power exchange", "You enjoy correcting, taming, or answering a partner who is teasingly disobedient.", ["A consequence you both picked before the bratting starts", "Taming that stays play, not a real punishment for a real fight", "Letting them win sometimes"]),
  primal_prey: copy("Primal (Prey)", "Roleplay and identity", "You want to be chased, caught, and taken in a primal scene.", ["A chase with a word that ends it", "Biting, pinning, or growling that was agreed", "A quiet hold after the hunt"]),
  primal_hunter: copy("Primal (Hunter)", "Roleplay and identity", "You want to hunt, catch, and take a partner who wants to be prey.", ["A short chase in a private room", "Pinning them only as long as the game is on", "Switching to ordinary names when it ends"]),
  exhibitionist: copy("Exhibitionist", "Social and sexual style", "You want to be seen, watched, or sexual where other adults can notice.", ["Sex where you might be heard, with a plan to stop if someone walks in", "Being watched by one other adult who agreed", "A club or party where everyone opted in"]),
  voyeur: copy("Voyeur", "Social and sexual style", "You enjoy watching other people naked, fucking, or in a scene.", ["Watching a partner with someone else, if everyone agreed", "A private scene you were invited to watch", "Porn or a story if a live watch is not on offer"]),
  experimentalist: copy("Experimentalist", "Sexual style", "You want to try new acts, materials, and fantasies instead of staying on one menu.", ["One new act, once, with a stop", "Latex, leather, or a toy you have not used", "A fantasy told out loud before anyone tries it"]),
  non_monogamist: copy("Non-monogamist", "Social and sexual style", "You want more than one person, or the option for either of you to see others.", ["Say what counts as cheating before anyone else is involved", "A threesome that every adult agrees to", "An open arrangement with a date night that stays yours"]),
  service_sub: copy("Service submissive", "Power exchange", "You want to serve: tasks, domestic work, and anticipating what they need.", ["A service task with a way to decline it", "Formal positions for one evening", "Service that ends before it becomes unpaid life labor"]),
  service_top: copy("Service top", "Power exchange", "You want to receive service, tasks, and a partner who treats you as the one in charge of that scene.", ["A drink, a kneel, or a task they offered", "Honorifics they agreed to", "Service that does not include their rent or their job"]),
  cnc_bottom: copy("CNC bottom", "Roleplay and identity", "You want consensual non-consent: to resist in a scene you already agreed to.", ["Write the stop word before the struggle", "A short CNC scene with a planned ending", "Plain language the moment the game is over"]),
  cnc_top: copy("CNC top", "Roleplay and identity", "You want a partner to resist in a scene they pre-negotiated.", ["The real stop is practiced before the roleplay", "No CNC while anyone is drunk", "End the plot the moment they use the stop"]),
  object_bottom: copy("Objectification bottom", "Roleplay and identity", "You want to be used as a sexual object or tool.", ["A scene where you are positioned and used, then checked on", "A word that returns you to being a person", "Objectification that stays in the scene"]),
  object_top: copy("Objectification top", "Roleplay and identity", "You want to treat a willing partner as a sexual object or tool.", ["Use them for your pleasure inside limits they set", "Check in before you ignore their reactions as part of the game", "Aftercare that treats them as a person again"]),
  protocol: copy("Protocol", "Power exchange", "You want rules, honorifics, and structured behavior, not only a vibe.", ["One rule you actually keep", "A greeting that starts the dynamic and an ending that stops it", "Protocol that does not run their work or their family"]),
  impact: copy("Impact player", "Sensation and impact", "Spanking, flogging, caning, or other impact is its own interest for you.", ["A hand, a paddle, or a flogger on a partner who asked", "A spanking hard enough to leave a mark", "Impact that stops when the word is used"]),
  sensory: copy("Sensory player", "Sensation and impact", "Blindfolds, temperature, texture, and overload are a major part of sex for you.", ["A blindfold with your hands free", "Ice, wax, or a rough palm, one at a time", "Sound low enough that a stop can be heard"]),
  edge: copy("Edge player", "Sensation and impact", "You are drawn to higher-intensity play, including fear, breath, or an edge, when trust is already there.", ["Fear play with a pre-agreed stop", "A hand on the throat that ends on a tap, not a how-to", "No edge play when either of you is drunk"]),
  caregiver: copy("Caregiver", "Sexual style", "You want to look after an adult partner: aftercare, tending, and the landing after intensity.", ["Water and a blanket after a scene", "A next-day check-in", "Asking whether they want to be held or left alone"]),
};

const PAIRS: Array<[string, string]> = [
  ["dominant", "submissive"],
  ["rigger", "rope_bunny"],
  ["sadist", "masochist"],
  ["brat_tamer", "brat"],
  ["degrader", "degradee"],
  ["owner", "pet"],
  ["master", "slave"],
  ["service_top", "service_sub"],
  ["object_top", "object_bottom"],
  ["cnc_top", "cnc_bottom"],
  ["primal_hunter", "primal_prey"],
  ["exhibitionist", "voyeur"],
];

function agreement(qMin: number, qMax: number, value: number): number {
  if (qMax <= qMin) return 50;
  return Math.max(0, Math.min(100, Math.round(((value - qMin) / (qMax - qMin)) * 100)));
}

export function answerPercent(q: { inputType?: string; scaleConfig?: { min?: number; max?: number } }, ans: QuestionAnswer | undefined): number | null {
  if (!ans || ans.skipped) return null;
  if (ans.firmBoundary || ans.curiosityLevel === "firm_boundary") return 0;
  if (typeof ans.customValue === "number" && q.inputType === "rating_scale") {
    return agreement(q.scaleConfig?.min ?? 1, q.scaleConfig?.max ?? 7, ans.customValue);
  }
  if (typeof ans.enjoyment === "number") return agreement(1, 5, ans.enjoyment);
  if (ans.curiosityLevel === "very_interested") return 95;
  if (ans.curiosityLevel === "interested") return 78;
  if (ans.curiosityLevel === "curious_uncertain") return 58;
  if (ans.curiosityLevel === "not_interested") return 18;
  return null;
}

export function rankAssessmentRoles(
  assessment: AssessmentDefinition,
  answers: Record<string, QuestionAnswer>,
): RoleScore[] {
  const buckets = new Map<string, number[]>();
  for (const q of assessment.questions) {
    const pct = answerPercent(q, answers[q.id]);
    if (pct === null) continue;
    const roles = (q.topicTags || []).filter((tag) => tag.startsWith("role:")).map((tag) => tag.slice(5));
    for (const key of roles) {
      const list = buckets.get(key) || [];
      list.push(pct);
      buckets.set(key, list);
    }
  }
  const fromTags = [...buckets.entries()].map(([key, scores]) => {
    const section = assessment.sections.find((s) => s.id === key);
    const meta = ROLE_COPY[key] || copy(
      section?.title || key,
      "Your pattern",
      `You keep landing on ${section?.title || key}. That is a pattern in your answers, not a task for a partner.`,
      [
        `Pick the ${section?.title || key} item you would actually do.`,
        "Name the condition that keeps it hot, and the one that makes it a no.",
      ],
    );
    return {
      key,
      ...meta,
      percent: Math.round(scores.reduce((s, n) => s + n, 0) / scores.length),
      answeredCount: scores.length,
    };
  });
  return fromTags.sort((a, b) => b.percent - a.percent || a.label.localeCompare(b.label));
}

export function rankingsFromRadar(result: ScoredAssessmentResult): RoleScore[] {
  return (result.radar || [])
    .filter((d) => d.answeredCount > 0)
    .map((d) => ({
      key: d.dimension,
      label: d.label,
      group: "Your pattern",
      percent: d.score,
      answeredCount: d.answeredCount,
      you: d.interpretation?.meaning || `You score ${d.score}% on ${d.label}.`,
      try: [
        d.interpretation?.experiment || `Pick the ${d.label} item that made you pause and say whether you want it.`,
        "Name the condition that would make this a yes, and the one that makes it a no.",
      ],
    }))
    .sort((a, b) => b.percent - a.percent || a.label.localeCompare(b.label));
}

export function attachRoleRankings(
  result: ScoredAssessmentResult,
  assessment: AssessmentDefinition,
  answers: Record<string, QuestionAnswer>,
): void {
  const tagged = rankAssessmentRoles(assessment, answers);
  result.roleRankings = tagged.length > 0 ? tagged : rankingsFromRadar(result);
}

export function compareRoleSets(a: RoleScore[], b: RoleScore[]): RoleComparison {
  const mapB = new Map(b.map((r) => [r.key, r]));
  const shared: string[] = [];
  const complements: string[] = [];
  const friction: string[] = [];
  let points = 0;
  let count = 0;
  for (const left of a) {
    const right = mapB.get(left.key);
    if (!right) continue;
    count += 1;
    const gap = Math.abs(left.percent - right.percent);
    points += 100 - gap;
    if (left.percent >= 65 && right.percent >= 65) shared.push(`${left.label} is high for both of you (${left.percent}% / ${right.percent}%).`);
  }
  for (const [top, bottom] of PAIRS) {
    const aTop = a.find((r) => r.key === top);
    const bBottom = mapB.get(bottom);
    const aBottom = a.find((r) => r.key === bottom);
    const bTop = mapB.get(top);
    if (aTop && bBottom && aTop.percent >= 65 && bBottom.percent >= 65) {
      complements.push(`Your ${aTop.label} (${aTop.percent}%) lines up with their ${bBottom.label} (${bBottom.percent}%).`);
    }
    if (aBottom && bTop && aBottom.percent >= 65 && bTop.percent >= 65) {
      complements.push(`Your ${aBottom.label} (${aBottom.percent}%) lines up with their ${bTop.label} (${bTop.percent}%).`);
    }
  }
  const aDom = a.find((r) => r.key === "dominant");
  const bDom = mapB.get("dominant");
  const aSw = a.find((r) => r.key === "switch");
  const bSw = mapB.get("switch");
  if (aDom && bDom && aDom.percent >= 70 && bDom.percent >= 70 && (aSw?.percent ?? 0) < 45 && (bSw?.percent ?? 0) < 45) {
    friction.push("You are both high Dominant and low Switch. Someone has to yield, or the scenes will fight.");
  }
  const score = count > 0 ? Math.round(points / count) : 0;
  const summary = complements[0]
    ? complements[0]
    : shared[0]
      ? shared[0]
      : count === 0
        ? "These results do not share category keys, so this is a side-by-side, not a matched score."
        : "No strong complementary pair jumped out. Read the gaps before you treat this as a match.";
  return { score, summary, complements: complements.slice(0, 4), shared: shared.slice(0, 4), friction };
}

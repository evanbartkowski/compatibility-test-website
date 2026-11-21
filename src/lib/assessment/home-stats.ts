export type Vec3 = readonly [number, number, number];
export const STAT_DIRECTIONS: readonly Vec3[] = [
  [0, 1, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, -1, 0],
  [1, 0, 0],
  [0, 0, -1],
];
export const STAT_FACES = [0, 3].flatMap((y) =>
  [1, 4].flatMap((x) => [2, 5].map((z) => [y, x, z])),
);
export const STAT_EDGES = STAT_DIRECTIONS.flatMap((a, i) =>
  STAT_DIRECTIONS.flatMap((b, j) =>
    j > i && a.reduce((sum, v, k) => sum + v * b[k], 0) === 0 ? [[i, j]] : [],
  ),
);
export function statVertices(
  values: readonly (number | null)[],
): Array<Vec3 | null> {
  return STAT_DIRECTIONS.map((direction, i) =>
    values[i] == null || !Number.isFinite(values[i])
      ? null
      : (direction.map(
          (n) => (n * Math.max(0, Math.min(100, values[i]!))) / 100,
        ) as unknown as Vec3),
  );
}
export function projectStatVertex([x, y, z]: Vec3, yaw: number, pitch: number) {
  const rx = x * Math.cos(yaw) - z * Math.sin(yaw),
    rz = x * Math.sin(yaw) + z * Math.cos(yaw);
  const ry = -y * Math.cos(pitch) + rz * Math.sin(pitch),
    depth = y * Math.sin(pitch) + rz * Math.cos(pitch),
    scale = 4 / (4 + depth);
  return { x: rx * scale, y: ry * scale, depth };
}
const definitions = [
  {
    key: "romance",
    label: "Romance",
    slug: "love-affection-preferences",
    categories: null,
    description:
      "Your reported preferences for affection and everyday connection.",
  },
  {
    key: "emotional",
    label: "Emotional",
    slug: "emotional-availability-reflection",
    categories: null,
    description:
      "Your reported emotional awareness, openness and availability.",
  },
  {
    key: "kink",
    label: "Freaky / kinky",
    slug: "erotic-blueprint-style",
    categories: ["kinky"],
    description: "Your interest in consensual sexual roles and chosen rituals.",
  },
  {
    key: "logical",
    label: "Logical",
    slug: "big-five-personality-profile",
    categories: ["logical_reasoning"],
    description:
      "Your preference for weighing evidence and comparing explanations. This is not an IQ score.",
  },
  {
    key: "communication",
    label: "Communication",
    slug: "conflict-communication-personality",
    categories: null,
    description:
      "Your reported listening, clarity, emotional regulation and repair habits.",
  },
  {
    key: "sensual",
    label: "Sensual",
    slug: "erotic-blueprint-style",
    categories: ["sensual"],
    description:
      "Your interest in sensory atmosphere and unhurried sexual buildup.",
  },
] as const;
export interface StatAxis {
  key: string;
  label: string;
  score: number | null;
  description: string;
  slug: string;
  sourceId?: string;
  answered: number;
  measuredCategories: number;
  totalCategories: number;
}
export interface StatsProfile {
  axes: StatAxis[];
  measured: number;
  updatedAt: string | null;
}
export interface HomeStats {
  current: StatsProfile;
  previous: StatsProfile | null;
}
interface Entry {
  submissionId: string;
  assessmentSlug: string;
  createdAt: string;
  result: {
    assessmentVersion: string;
    radar: Array<{
      dimension: string;
      label: string;
      score: number;
      answeredCount: number;
    }>;
  };
}
function project(entries: Entry[]): StatsProfile {
  const axes = definitions.map((d): StatAxis => {
    const entry = entries.find((s) => s.assessmentSlug === d.slug);
    const eligible =
      entry?.result.radar.filter(
        (r) =>
          !d.categories ||
          (d.categories as readonly string[]).includes(r.dimension),
      ) || [];
    const measured = eligible.filter(
      (r) => r.answeredCount > 0 && Number.isFinite(r.score),
    );
    return {
      key: d.key,
      label: d.label,
      description: d.description,
      slug: d.slug,
      score: measured.length
        ? Math.round(
            measured.reduce((sum, r) => sum + r.score, 0) / measured.length,
          )
        : null,
      answered: measured.reduce((sum, r) => sum + r.answeredCount, 0),
      measuredCategories: measured.length,
      totalCategories: eligible.length || d.categories?.length || 5,
      ...(measured.length ? { sourceId: entry!.submissionId } : {}),
    };
  });
  return {
    axes,
    measured: axes.filter((a) => a.score !== null).length,
    updatedAt:
      entries.find((e) => axes.some((a) => a.sourceId === e.submissionId))
        ?.createdAt || null,
  };
}
export function buildHomeStats(input: Entry[]): HomeStats {
  const ordered = [...input].sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) ||
      b.submissionId.localeCompare(a.submissionId),
  );
  const relevant = ordered.filter((e) =>
    definitions.some((d) => d.slug === e.assessmentSlug),
  );
  const latest = [
    ...new Map(
      [...relevant].reverse().map((e) => [e.assessmentSlug, e]),
    ).values(),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const retake = latest.find((current) =>
    relevant.some(
      (e) =>
        e.assessmentSlug === current.assessmentSlug &&
        e.submissionId !== current.submissionId &&
        e.result.assessmentVersion === current.result.assessmentVersion,
    ),
  );
  const earlier = retake
    ? relevant
        .slice(relevant.indexOf(retake) + 1)
        .filter((e) =>
          latest.some(
            (current) =>
              e.assessmentSlug === current.assessmentSlug &&
              e.result.assessmentVersion === current.result.assessmentVersion,
          ),
        )
    : [];
  const beforeRetake = [
    ...new Map(
      [...earlier].reverse().map((e) => [e.assessmentSlug, e]),
    ).values(),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    current: project(latest),
    previous: retake ? project(beforeRetake) : null,
  };
}
export const EXAMPLE_STATS: StatsProfile = {
  measured: 6,
  updatedAt: null,
  axes: definitions.map((d, i) => ({
    ...d,
    score: [78, 86, 62, 71, 83, 92][i],
    answered: 0,
    measuredCategories: 0,
    totalCategories: 0,
  })),
};
export const EXAMPLE_COMPARISON: StatsProfile = {
  measured: 6,
  updatedAt: null,
  axes: EXAMPLE_STATS.axes.map((d, i) => ({
    ...d,
    score: [88, 65, 86, 90, 68, 72][i],
  })),
};

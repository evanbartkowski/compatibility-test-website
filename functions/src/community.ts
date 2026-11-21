/** Trusted server projection. Never publish raw question responses or participant identifiers. */
export function aggregateCloudSubmissions(
  records: Record<string, unknown>[],
  minimum = 50,
) {
  type Sample = { score: number; label: string };
  const latest = new Map<string, Record<string, unknown>>();
  for (const record of records) {
    const r = record.result as { scoringEngineVersion?: string } | undefined;
    const person = record.ownerUid || record.sessionKey;
    if (!person || record.perspective !== "primary" || !r?.scoringEngineVersion)
      continue;
    const key = JSON.stringify([
      person,
      record.assessmentSlug,
      record.assessmentVersion,
      r.scoringEngineVersion,
      record.mode,
    ]);
    if (String(record.createdAt) > String(latest.get(key)?.createdAt || ""))
      latest.set(key, record);
  }
  const groups = new Map<
    string,
    {
      assessmentSlug: string;
      assessmentVersion: string;
      scoringEngineVersion: string;
      mode: string;
      dimension: string;
      samples: Sample[];
    }
  >();
  for (const record of latest.values()) {
    if (
      !(record.consent as { optInCommunityStats?: boolean })
        ?.optInCommunityStats
    )
      continue;
    const result = record.result as {
      scoringEngineVersion: string;
      radar?: Array<{
        dimension: string;
        label: string;
        score: number;
        answeredCount: number;
      }>;
    };
    for (const d of result.radar || []) {
      if (
        !(d.answeredCount > 0) ||
        !Number.isFinite(d.score) ||
        d.score < 0 ||
        d.score > 100
      )
        continue;
      const key = JSON.stringify([
        record.assessmentSlug,
        record.assessmentVersion,
        result.scoringEngineVersion,
        record.mode,
        d.dimension,
      ]);
      const group = groups.get(key) || {
        assessmentSlug: String(record.assessmentSlug),
        assessmentVersion: String(record.assessmentVersion),
        scoringEngineVersion: result.scoringEngineVersion,
        mode: String(record.mode),
        dimension: d.dimension,
        samples: [],
      };
      group.samples.push({ score: d.score, label: d.label });
      groups.set(key, group);
    }
  }
  return [...groups.values()]
    .filter((g) => g.samples.length >= minimum)
    .map(({ samples, ...group }) => {
      const count = samples.length,
        mean = samples.reduce((sum, s) => sum + s.score, 0) / count;
      const histogram: Record<string, number> = Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [`b${i}`, 0]),
      );
      for (const sample of samples)
        histogram[`b${Math.min(9, Math.floor(sample.score / 10))}`]++;
      return {
        ...group,
        label: samples[0].label,
        respondentCount: count,
        meanScore: Math.round(mean * 100) / 100,
        stdDevScore:
          Math.round(
            Math.sqrt(
              samples.reduce((sum, s) => sum + (s.score - mean) ** 2, 0) /
                count,
            ) * 100,
          ) / 100,
        histogram,
        available: true,
      };
    });
}

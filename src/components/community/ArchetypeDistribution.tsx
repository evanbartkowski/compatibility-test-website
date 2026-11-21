import type { CommunityArchetypeAggregate } from "@/lib/assessment/community";
export function ArchetypeDistribution({
  archetypes,
  isSyntheticDemo = false,
}: {
  archetypes?: CommunityArchetypeAggregate[];
  isSyntheticDemo?: boolean;
}) {
  if (!archetypes?.length) return null;
  return (
    <section className="mt-7 border-t pt-6">
      <h3 className="font-display text-2xl">How common are these patterns?</h3>
      <p className="text-xs text-[var(--ink-muted)] mt-3 leading-relaxed">
        {isSyntheticDemo
          ? "Synthetic example archetypes."
          : "Archetypes from opted-in people in this version and form."}{" "}
        Small groups are pooled to protect privacy. These labels summarize
        scores, not fixed identities.
      </p>
      <div className="archetype-distribution">
        {archetypes.map((a) => (
          <div key={a.name}>
            <span>{a.name}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${a.percent}%` }} />
            </div>
            <strong>{a.percent}%</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

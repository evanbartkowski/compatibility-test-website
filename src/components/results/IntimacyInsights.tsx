import type { ScoredAssessmentResult } from "@/lib/assessment/types";

const format = (value: number | null) =>
  value === null ? "Not rated" : `${value}/100`;
export function IntimacyInsights({
  result,
}: {
  result: ScoredAssessmentResult;
}) {
  const profile = result.intimacyProfile;
  if (!profile) return null;
  return (
    <section
      className="intimacy-insights mt-7"
      aria-labelledby="intimacy-insights-title"
    >
      <span className="intro-pill">Private reflection · 18+</span>
      <h2 id="intimacy-insights-title" className="font-display mt-4">
        Want, willing, done. Not the same number.
      </h2>
      <p className="mt-3">
        Desire, willingness, and experience are separate. A high want with low
        experience is a craving, not a plan. A hard limit blocks partner
        suggestions even when the want is loud. Unrated stays unmeasured.
      </p>
      {result.assessmentSlug === "spicy-would-you-rather" && (
        <p className="mt-2">
          The category chart above shows which direction you chose, not how much
          you desire it. The desire ratings below measure appeal separately.
          Neither end of a direction is better.
        </p>
      )}
      <div className="intimacy-channel-grid">
        {profile.channels.map((channel) => (
          <article className="intimacy-channel" key={channel.dimension}>
            <h3>{channel.label}</h3>
            <dl>
              {(
                [
                  ["Desire", channel.desireScore],
                  ["Willingness", channel.willingnessScore],
                  ["Experience", channel.experienceScore],
                ] as const
              ).map(([label, score]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {format(score)}
                    <span
                      aria-hidden="true"
                      style={{
                        display: "block",
                        height: 6,
                        marginTop: 4,
                        borderRadius: 99,
                        background: "var(--bg-inset, rgba(255,255,255,.08))",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          width: `${score ?? 0}%`,
                          borderRadius: 99,
                          background:
                            label === "Desire"
                              ? "var(--accent-plum, #b31d4e)"
                              : label === "Experience"
                                ? "var(--accent-gold, #c4a574)"
                                : "var(--accent-cyan, #7ec8c3)",
                        }}
                      />
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            {channel.desireScore !== null &&
              channel.experienceScore !== null &&
              channel.desireScore - channel.experienceScore >= 25 && (
                <p>
                  Craving gap: desire is {channel.desireScore - channel.experienceScore}{" "}
                  points ahead of experience. That is a conversation, not an instruction.
                </p>
              )}
            {(channel.receiveScore !== null || channel.offerScore !== null) && (
              <p>
                Receive {format(channel.receiveScore)} · Give{" "}
                {format(channel.offerScore)}
                {channel.receiveScore !== null &&
                channel.offerScore !== null &&
                Math.abs(channel.receiveScore - channel.offerScore) >= 20
                  ? ` · ${channel.receiveScore > channel.offerScore ? "you want this done to you more than you want to do it" : "you want to do this more than you want it done to you"}`
                  : ""}
              </p>
            )}
            <small>
              {channel.desireCount} desire ratings · {channel.experienceCount}{" "}
              experience ratings
            </small>
          </article>
        ))}
      </div>
      <p className="text-xs">
        These are exploratory averages. Willingness positions summarize explicit
        responses, not permission or a probability of consent. Experience gaps
        are observations, never recommendations.
      </p>
      <details className="intimacy-details mt-5">
        <summary>
          Your private limits & visibility{" "}
          <span>{profile.hardLimits.length} limits</span>
        </summary>
        <div className="intimacy-details-body">
          <p>
            {profile.privateCount} answered items are always private. Limits and
            unmatched answers do not appear in partner reports, mismatch counts
            or category overlays.
          </p>
          {profile.hardLimits.length ? (
            <ul>
              {profile.hardLimits.map((limit) => (
                <li key={limit.questionId}>{limit.label}</li>
              ))}
            </ul>
          ) : (
            <p>
              No hard limits were recorded. This does not mean everything is
              welcome.
            </p>
          )}
        </div>
      </details>
      {result.intimacyBlueprint && (
        <div className="intimacy-blueprint mt-6">
          <h3 className="font-display">Across your saved reflections</h3>
          <p>{result.intimacyBlueprint.note}</p>
          {result.intimacyBlueprint.axes.length ? (
            <>
              <dl className="blueprint-axes">
                {result.intimacyBlueprint.axes.map((axis) => (
                  <div key={axis.key}>
                    <dt>{axis.label}</dt>
                    <dd>
                      {axis.score}/100{" "}
                      <small>
                        from {axis.sourceCount}{" "}
                        {axis.sourceCount === 1 ? "reflection" : "reflections"}
                      </small>
                    </dd>
                  </div>
                ))}
              </dl>
              <details className="intimacy-details">
                <summary>Which reflections shaped this?</summary>
                <ul>
                  {result.intimacyBlueprint.sources.map((source) => (
                    <li key={`${source.title}-${source.createdAt}`}>
                      {source.title} ·{" "}
                      {new Date(source.createdAt).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </li>
                  ))}
                </ul>
              </details>
            </>
          ) : (
            <p>
              Complete another reflection in the adult collection, then retake
              this blueprint to include it. Your current answers above still
              stand on their own.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

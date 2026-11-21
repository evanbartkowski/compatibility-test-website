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
        Different answers. Different meanings.
      </h2>
      <p className="mt-3">
        Desire, freely chosen willingness and past experience stand on their
        own. A hard limit blocks partner suggestions even when desire is high.
        Unrated fields stay unmeasured.
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
              <div>
                <dt>Desire</dt>
                <dd>{format(channel.desireScore)}</dd>
              </div>
              <div>
                <dt>Willingness</dt>
                <dd>{format(channel.willingnessScore)}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{format(channel.experienceScore)}</dd>
              </div>
            </dl>
            {(channel.receiveScore !== null || channel.offerScore !== null) && (
              <p>
                Receiving {format(channel.receiveScore)} · Offering{" "}
                {format(channel.offerScore)}
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

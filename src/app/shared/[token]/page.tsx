import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Fingerprint } from "lucide-react";
import { getPublicSharedProfile } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shared discovery profile",
  robots: { index: false, follow: false },
  description: "A selection of results shared by its owner.",
};
export default async function SharedProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const profile = getPublicSharedProfile((await params).token);
  if (!profile)
    return (
      <div className="site-shell py-20">
        <div className="empty-state">
          <LockKeyhole className="mx-auto mb-4" />
          <h1 className="font-display text-3xl">
            This shared profile is unavailable.
          </h1>
          <p>
            The link may have expired or been revoked. Ask its owner for a new
            link.
          </p>
          <Link className="button button-primary" href="/explore">
            Explore your own profile
          </Link>
        </div>
      </div>
    );
  return (
    <div className="site-shell py-12">
      <span className="intro-pill">
        <LockKeyhole size={13} />
        Shared by choice
      </span>
      <h1 className="font-display text-4xl mt-6">{profile.displayName}</h1>
      <p className="text-[var(--ink-muted)] leading-relaxed mt-4 max-w-2xl">
        These are the results this person chose to share. Private answers,
        unselected scores, and other tests remain private.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {profile.results.map((result, index) => (
          <article className="comparison-panel" key={index}>
            <Fingerprint size={26} className="text-[var(--accent-plum)] mb-6" />
            {result.assessmentTitle && (
              <p className="muted-label mb-3">{result.assessmentTitle}</p>
            )}
            <h2 className="font-display text-3xl">
              {result.archetype?.name || "Selected patterns"}
            </h2>
            {result.archetype && (
              <p className="mt-3">{result.archetype.tagline}</p>
            )}
            <div className="snapshot-rows mt-8">
              {result.dimensions.map((d) => (
                <div key={d.key}>
                  <div className="snapshot-row-top">
                    <span>{d.label}</span>
                    <strong>{d.score}%</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="example-note">
              Exploratory self-report · Assessment v{result.assessmentVersion}
            </p>
          </article>
        ))}
      </div>
      <p className="muted-label mt-8">
        This selection expires{" "}
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(profile.expiresAt))}
        . Scores describe tendencies, rather than predicting relationship
        outcomes.
      </p>
    </div>
  );
}

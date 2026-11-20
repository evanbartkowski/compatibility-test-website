import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { brandConfig } from "@/config/brand";
import { builtInAssessments } from "@/data/assessments/catalog";

export function SiteFooter() {
  return (
    <footer
      className="mt-24 border-t py-12 text-sm"
      style={{
        backgroundColor: "var(--bg-subtle)",
        borderColor: "var(--border-hairline)",
        color: "var(--ink-secondary)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-[var(--ink-primary)]">
              {brandConfig.name}
            </p>
            <p className="mt-3 max-w-md leading-relaxed">
              {brandConfig.tagline} Strictly for adults {brandConfig.minimumAge}+. Built for
              personal reflection rather than clinical diagnosis.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[var(--ink-primary)]">
                <Lock className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                Zero answers in invitation URLs
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--ink-primary)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                Community threshold n &ge; {brandConfig.communityMinimumThreshold}
              </span>
            </div>
          </div>

          <div>
            <p className="font-semibold text-[var(--ink-primary)]">Platform</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/explore" className="hover:text-[var(--ink-primary)] hover:underline">
                  Explore All {builtInAssessments.length} Assessments
                </Link>
              </li>
              <li>
                <Link href="/couples" className="hover:text-[var(--ink-primary)] hover:underline">
                  Couples &amp; Partner Invites
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[var(--ink-primary)] hover:underline">
                  My Discovery Profile
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-[var(--ink-primary)] hover:underline">
                  My Results &amp; Exports
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[var(--ink-primary)] hover:underline">
                  Community Insights
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-[var(--ink-primary)] hover:underline">
                  Account &amp; Privacy Settings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--ink-primary)] hover:underline">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[var(--ink-primary)]">Methodology &amp; Ethics</p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed">
              <li>Consent and firm boundaries always supersede aggregate compatibility scores.</li>
              <li>Opted-in community comparisons are completely optional and deletable.</li>
              <li>Published exploratory survey figures are clearly separated from platform data.</li>
              <li className="font-mono-tabular pt-1 text-[var(--ink-muted)]">
                Scoring engine v{brandConfig.scoringEngineVersion}
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center"
          style={{ borderColor: "var(--border-hairline)", color: "var(--ink-muted)" }}
        >
          <p>&copy; {new Date().getFullYear()} {brandConfig.name}. Built for thoughtful adult self-discovery.</p>
          <p>No sensitive answers are shared with external AI providers or advertising trackers.</p>
        </div>
      </div>
    </footer>
  );
}

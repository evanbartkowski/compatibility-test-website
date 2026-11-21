import Link from "next/link";
import { Clock, Users } from "lucide-react";
import type { CSSProperties } from "react";
import type { AssessmentSummary } from "@/lib/assessment/catalog-summary";

const categories = {
  romance: {
    label: "Romance & connection",
    color: "var(--accent-rose)",
    kind: 0,
  },
  personality: {
    label: "Personality & self",
    color: "var(--accent-plum)",
    kind: 1,
  },
  "sexuality-intimacy": {
    label: "Intimacy & desire",
    color: "var(--accent-rose)",
    kind: 2,
  },
  compatibility: {
    label: "Couples & compatibility",
    color: "var(--accent-cyan)",
    kind: 3,
  },
};
const descriptions: Record<string, string> = {
  "attachment-style-discovery":
    "Understand how you connect, seek reassurance, and find your space in a relationship.",
  "love-affection-preferences":
    "Understand which forms of appreciation, attention, practical help and emotional comfort matter to you.",
  "big-five-personality-profile":
    "Explore your everyday patterns and how you weigh evidence, intuition and decisions.",
  "intimacy-partner-preferences":
    "Understand how desire emerges, the pace you enjoy and what helps you communicate and reconnect.",
  "couples-bucket-list-matcher":
    "Find the experiences you both want to share, from small adventures to big dreams.",
};
export function ProfileGlyph({ kind = 0 }: { kind?: number }) {
  return (
    <svg viewBox="0 0 190 110" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1">
        {kind === 0 ? (
          <>
            <path
              d="M95 88S45 65 45 39a22 22 0 0 1 50-9 22 22 0 0 1 50 9c0 26-50 49-50 49Z"
              opacity=".8"
            />
            <path
              d="M95 77S58 59 58 40a16 16 0 0 1 37-7 16 16 0 0 1 37 7c0 19-37 37-37 37Z"
              opacity=".5"
            />
            <path
              d="M95 65S71 53 71 42a10 10 0 0 1 24-5 10 10 0 0 1 24 5c0 11-24 23-24 23Z"
              opacity=".3"
            />
          </>
        ) : kind === 1 ? (
          <>
            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <ellipse
                key={deg}
                cx="95"
                cy="55"
                rx="44"
                ry="18"
                transform={`rotate(${deg} 95 55)`}
                opacity=".6"
              />
            ))}
            <circle cx="95" cy="55" r="5" fill="currentColor" />
          </>
        ) : kind === 2 ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${35 + i * 12} 72 C${55 + i * 8} ${-10 + i * 5},${110 + i * 3} ${118 - i * 10},${155 - i * 8} ${28 + i * 9}`}
                opacity={0.25 + i * 0.14}
              />
            ))}
            <circle cx="95" cy="52" r="28" opacity=".25" />
          </>
        ) : (
          <>
            <circle cx="76" cy="55" r="32" opacity=".7" />
            <circle cx="114" cy="55" r="32" opacity=".7" />
            <ellipse
              cx="95"
              cy="55"
              rx="13"
              ry="25"
              fill="currentColor"
              opacity=".12"
            />
            <circle cx="76" cy="55" r="22" opacity=".25" />
            <circle cx="114" cy="55" r="22" opacity=".25" />
          </>
        )}
      </g>
    </svg>
  );
}
export function TestCard({
  assessment,
  featured = false,
  resultId,
}: {
  assessment: AssessmentSummary;
  featured?: boolean;
  resultId?: string;
}) {
  const category = categories[assessment.category];
  const supportsQuick = assessment.supportsQuickMode !== false;
  return (
    <article
      className="test-card"
      style={{ "--card-accent": category.color } as CSSProperties}
    >
      <div className="test-card-art">
        <ProfileGlyph kind={category.kind} />
        {featured && <span className="card-tag">Start here</span>}
        {assessment.adultsOnly && (
          <span className="mature-tag">Mature · 18+</span>
        )}
      </div>
      <div className="test-card-content">
        <p className="card-category">{assessment.collection ? "The intimacy collection · 18+" : category.label}</p>
        <h3>{assessment.shortTitle}</h3>
        <p className="test-card-description">
          {descriptions[assessment.slug] || assessment.audienceNote}
        </p>
        <div className="test-card-meta">
          <span>
            <Clock size={13} />
            {supportsQuick
              ? assessment.estimatedMinutesQuick
              : assessment.estimatedMinutesComplete}{" "}
            min
            {assessment.questionCount
              ? ` · ${assessment.standardQuestionCount} questions`
              : ""}
          </span>
          <span>
            <Users size={13} />
            {assessment.supportsPartnerMatching
              ? "Compare with a partner"
              : "Personal discovery"}
          </span>
        </div>
        <div className="test-card-actions">
          <Link
            className="button button-primary button-small"
            href={`/assess/${assessment.slug}?mode=${supportsQuick ? "quick" : "complete"}`}
          >
            {resultId ? "Take again" : assessment.collection ? "Try the teaser" : "Take the test"}
          </Link>
          {supportsQuick && (
            <Link
              className="button button-quiet button-small"
              href={`/assess/${assessment.slug}?mode=complete`}
            >
              {assessment.questionCount
                ? `All ${assessment.questionCount} questions`
                : "Go deeper"}
            </Link>
          )}
        </div>
        {resultId && (
          <Link href={`/results/${resultId}`} className="text-link mt-3">
            View saved result
          </Link>
        )}
      </div>
    </article>
  );
}

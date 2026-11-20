import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div
        className="rounded-3xl border p-8"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-hairline)",
        }}
      >
        <h1 className="font-display text-4xl text-[var(--ink-primary)]">Page Not Found</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
          The assessment or private report you requested does not exist or is no longer available.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "var(--accent-plum)",
            color: "var(--accent-plum-contrast)",
          }}
        >
          Return to Between Us
        </Link>
      </div>
    </div>
  );
}

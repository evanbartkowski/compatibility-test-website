import { useId } from "react";

/** Original, decorative vector miniatures. No font glyphs or external assets. */
export function InterestArtwork({ topic }: { topic: string }) {
  const id = `interest-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return <svg viewBox="0 0 40 40" className="interest-artwork" aria-hidden="true" focusable="false" fill="none">
    <defs><linearGradient id={id} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="var(--accent-plum)" /><stop offset="1" stopColor="var(--accent-cyan)" /></linearGradient></defs>
    <circle cx="20" cy="20" r="18" fill={`url(#${id})`} fillOpacity=".09" />
    <g stroke={`url(#${id})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {topic === "bondage" ? <><path d="M11 11c10-5 22 8 15 15s-20-5-15-15Zm18 0c-10-5-22 8-15 15s20-5 15-15Z" /><path d="m16 27-3 6m11-6 3 6" /></>
        : topic === "spanking" ? <><path d="M12 25c5 4 11 4 16 0M11 20c5 4 13 4 18 0M13 15c4 3 10 3 14 0" /><path d="m20 7 1.5 3.5L25 12l-3.5 1.5L20 17l-1.5-3.5L15 12l3.5-1.5Z" /></>
        : topic === "role-play" ? <><path d="m9 11 13 3-2 11c-1 4-6 6-9 2-2-3-3-9-2-16Z" /><path d="m22 10 10 1c1 8-1 16-6 18m-15-12 3 1m3 0 2 1m-7 4c1 2 3 2 5 1m7-8 2-1m2 2 2-1" /></>
        : topic === "blindfolds" ? <><path d="M8 15c5-2 9-2 12 0 3-2 7-2 12 0v10c-4 2-8 1-12-1-4 2-8 3-12 1V15Z" /><path d="M8 19 4 17m4 5-4 2m28-5 4-2m-4 5 4 2M15 17l-2 6m14-6-2 6" /></>
        : topic === "dirty-talk" ? <><path d="M8 11h24v15H20l-7 5v-5H8V11Z" /><path d="M13 17h14m-14 4h9" /><circle cx="29" cy="8" r="2" /></>
        : <><path d="M17 17c-5 3-6 8-3 12 2 3 6 3 8 0 2-3 0-6-1-9-1-2-1-4-4-3Z" /><ellipse cx="24" cy="10" rx="3" ry="4" /><path d="m17 11 1 2m-5 1 1 2m-4 2 1 2" /></>}
    </g>
  </svg>;
}

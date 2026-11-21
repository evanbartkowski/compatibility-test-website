"use client";

import { useEffect, useMemo, useState } from "react";
import { getGuestSubmissions } from "./guest-storage";
import type { ScoredAssessmentResult } from "./types";

export interface SavedResultEntry {
  submissionId: string;
  assessmentSlug: string;
  createdAt: string;
  result: ScoredAssessmentResult;
}

const EMPTY: SavedResultEntry[] = [];

export function useSavedResults(initial: SavedResultEntry[] = EMPTY) {
  const [browser, setBrowser] = useState<SavedResultEntry[]>([]);
  const [remote, setRemote] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { setRemote(initial); }, [initial]);
  useEffect(() => {
    const controller = new AbortController();
    const loadBrowser = () => { setBrowser(getGuestSubmissions()); setReady(true); };
    loadBrowser();
    window.addEventListener("storage", loadBrowser);
    fetch("/api/dashboard", { signal: controller.signal })
      .then(async response => {
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
        const data = await response.json();
        if (!controller.signal.aborted && Array.isArray(data.submissions)) setRemote(data.submissions);
      })
      .catch(() => { /* Browser results remain available without a server. */ });
    return () => { controller.abort(); window.removeEventListener("storage", loadBrowser); };
  }, []);
  const serverIds = useMemo(() => new Set([...initial, ...remote].map(s => s.submissionId)), [initial, remote]);
  const submissions = useMemo(() => {
    const map = new Map<string, SavedResultEntry>();
    for (const entry of [...browser, ...initial, ...remote]) {
      if (entry?.submissionId && entry.result?.perspective === "primary") map.set(entry.submissionId, entry);
    }
    return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [browser, initial, remote]);
  const resultHref = (entry: SavedResultEntry, tab?: string) => {
    const hash = tab === "advice" ? "#advice-guide-title" : "";
    const queryTab = tab && tab !== "advice" ? tab : undefined;
    if (serverIds.has(entry.submissionId)) return `/results/${encodeURIComponent(entry.submissionId)}${queryTab ? `?tab=${queryTab}` : ""}${hash}`;
    return `/results?id=${encodeURIComponent(entry.submissionId)}${queryTab ? `&tab=${queryTab}` : ""}${hash}`;
  };
  return { submissions, ready, serverIds, resultHref };
}

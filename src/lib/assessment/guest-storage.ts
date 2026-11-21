import type { ScoredAssessmentResult, QuestionAnswer } from "./types";

export interface GuestSubmission {
  submissionId: string;
  assessmentSlug: string;
  assessmentVersion: string;
  mode: "quick" | "complete";
  perspective: "primary" | "partner";
  optInCommunityStats: boolean;
  createdAt: string;
  result: ScoredAssessmentResult;
  answers: Record<string, QuestionAnswer>;
}

const GUEST_SUBMISSIONS_KEY = "between_us_guest_submissions";
const SUBMISSION_PREFIX = "between_us_submission_";

export function generateGuestSubmissionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `sub_guest_${timestamp}_${random}`;
}

export function getGuestSubmissions(): GuestSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_SUBMISSIONS_KEY);
    if (!raw) {
      // Check legacy single-item keys if any
      const list: GuestSubmission[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(SUBMISSION_PREFIX)) {
          const item = JSON.parse(window.localStorage.getItem(k) || "{}");
          if (item && item.submissionId && item.result) {
            list.push(item);
          }
        }
      }
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
  } catch {
    // Storage access issue or JSON error
  }
  return [];
}

export function getGuestSubmission(submissionId: string): GuestSubmission | null {
  if (typeof window === "undefined" || !submissionId) return null;
  try {
    // Try direct key first
    const direct = window.localStorage.getItem(`${SUBMISSION_PREFIX}${submissionId}`);
    if (direct) {
      const parsed = JSON.parse(direct);
      if (parsed && parsed.result) return parsed;
    }
    // Search list
    const all = getGuestSubmissions();
    const found = all.find((s) => s.submissionId === submissionId);
    if (found) return found;
  } catch {
    // Storage error
  }
  return null;
}

export function saveGuestSubmission(submission: GuestSubmission): void {
  if (typeof window === "undefined" || !submission) return;
  try {
    // Save individual key for fast O(1) lookup
    window.localStorage.setItem(
      `${SUBMISSION_PREFIX}${submission.submissionId}`,
      JSON.stringify(submission),
    );

    // Save into aggregated list
    const current = getGuestSubmissions();
    const existingIndex = current.findIndex(
      (s) => s.submissionId === submission.submissionId,
    );
    if (existingIndex >= 0) {
      current[existingIndex] = submission;
    } else {
      current.unshift(submission);
    }
    window.localStorage.setItem(GUEST_SUBMISSIONS_KEY, JSON.stringify(current));
  } catch {
    // Storage quota or disabled
  }
}

export function deleteGuestSubmission(submissionId: string): void {
  if (typeof window === "undefined" || !submissionId) return;
  try {
    window.localStorage.removeItem(`${SUBMISSION_PREFIX}${submissionId}`);
    const current = getGuestSubmissions().filter(
      (s) => s.submissionId !== submissionId,
    );
    window.localStorage.setItem(GUEST_SUBMISSIONS_KEY, JSON.stringify(current));
  } catch {
    // Storage error
  }
}

export function clearAllGuestSubmissions(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(SUBMISSION_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    window.localStorage.removeItem(GUEST_SUBMISSIONS_KEY);
  } catch {
    // Storage error
  }
}

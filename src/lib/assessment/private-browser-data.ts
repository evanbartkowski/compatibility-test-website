/** Remove this site's private copies while preserving unrelated data and theme. */
export function clearPrivateBrowserData(): boolean {
  if (typeof window === "undefined") return true;
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("between_us_") && key !== "between_us_theme") window.localStorage.removeItem(key);
    }
    window.dispatchEvent(new Event("storage"));
    return true;
  } catch { return false; }
}

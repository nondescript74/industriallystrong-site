export function trackEvent(category, label) {
  if (typeof window === "undefined") return;

  if (window._statcounter) {
    try {
      window._statcounter.push({
        event: category,
        label: label,
        path: window.location.pathname
      });
    } catch (e) {
      console.debug("Statcounter event skipped");
    }
  }
}

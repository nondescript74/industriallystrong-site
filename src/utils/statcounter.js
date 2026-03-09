export function trackStatcounterPageView() {
  if (typeof window === "undefined") return;

  if (window._statcounter) {
    try {
      window._statcounter.record_pageview();
    } catch (e) {
      console.debug("Statcounter tracking skipped");
    }
  }
}

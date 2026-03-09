import { useEffect, useState } from "react";

export default function LiveMetricsCard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const res = await fetch("/api/metrics");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setMetrics(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Metrics unavailable");
        }
      }
    }

    load();
    const timer = setInterval(load, 60000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <section
      style={{
        marginTop: "60px",
        border: "1px solid #1e293b",
        borderRadius: "14px",
        padding: "28px",
        background: "#111827",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "10px" }}>
        Live Site Activity
      </h2>

      <p style={{ opacity: 0.82, marginTop: 0, marginBottom: "20px" }}>
        Real-time telemetry from the site analytics layer.
      </p>

      {error && <div style={{ opacity: 0.72 }}>{error}</div>}

      {!error && !metrics && (
        <div style={{ opacity: 0.72 }}>Loading metrics…</div>
      )}

      {!error && metrics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "18px",
          }}
        >
          <div className="structure-card">
            <h3>Visitors Today</h3>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
              {metrics.visitors_today ?? "—"}
            </p>
          </div>

          <div className="structure-card">
            <h3>Page Views</h3>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
              {metrics.pageviews_today ?? "—"}
            </p>
          </div>

          <div className="structure-card">
            <h3>First-Time Visits</h3>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
              {metrics.first_time_visits ?? "—"}
            </p>
          </div>

          <div className="structure-card">
            <h3>Returning Visits</h3>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
              {metrics.returning_visits ?? "—"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

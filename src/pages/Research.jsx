import PageShell from "../components/PageShell";

export default function Research() {
  return (
    <PageShell>
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>Research</h1>

        <p style={{ fontSize: "20px", maxWidth: "860px", opacity: 0.9 }}>
          Research systems and technical architectures that support deployed
          applications, strategy intelligence, and future program concepts.
        </p>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>MHT-FAISS Strategy Engine</h2>

        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          A real-time research engine for exploring large candidate populations
          of financial strategies using Multiple Hypothesis Tracking and
          FAISS-based vector search. The system supports interactive analysis of
          strategies that have already been filtered or evaluated by AI agents.
        </p>

        <div style={{ marginTop: "28px" }}>
          <a
            href="https://web-production-06a1.up.railway.app"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              border: "1px solid #334155",
              borderRadius: "10px",
              textDecoration: "none",
              color: "white",
              background: "#111827",
            }}
          >
            View live MHT-FAISS demo
          </a>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Architecture flow</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "24px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              border: "1px solid #243041",
              borderRadius: "12px",
              padding: "18px",
            }}
          >
            <strong>Strategy inputs</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              Public and generated strategies enter the system.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #243041",
              borderRadius: "12px",
              padding: "18px",
            }}
          >
            <strong>Agent evaluation</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              AI agents classify, score, and enrich candidates.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #243041",
              borderRadius: "12px",
              padding: "18px",
            }}
          >
            <strong>Vector indexing</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              FAISS organizes high-dimensional strategy representations.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #243041",
              borderRadius: "12px",
              padding: "18px",
            }}
          >
            <strong>Hypothesis tracking</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              MHT evolves and prunes competing paths over time.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #243041",
              borderRadius: "12px",
              padding: "18px",
            }}
          >
            <strong>Interactive review</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              Users explore rankings, branches, and candidate trajectories.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Why it matters</h2>

        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          This work connects research architecture directly to product systems.
          The engine is not an isolated demo: it informs strategy intelligence
          workflows, supports QRLPhoenix, and shows how advanced search and
          tracking methods can become usable system components.
        </p>

        <ul style={{ opacity: 0.82 }}>
          <li>Bridges research and deployable product architecture</li>
          <li>Supports fintech strategy discovery workflows</li>
          <li>Demonstrates technical depth behind broader system concepts</li>
          <li>Provides visible evidence of implementation capability</li>
        </ul>
      </section>
    </PageShell>
  );
}

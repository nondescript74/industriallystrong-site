import PageShell from "../components/PageShell";
import PrimaryButton from "../components/PrimaryButton";

export default function Architecture() {
  return (
    <PageShell>
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          System Architecture
        </h1>

        <p style={{ fontSize: "20px", maxWidth: "860px", opacity: 0.9 }}>
          IndustriallyStrong connects deployed applications, agent-driven
          analysis, and research infrastructure into a unified technical stack.
        </p>
      </section>

      <section className="architecture-flow">
        <div className="architecture-flow__intro">
          <h2
            className="section-title"
            style={{ textAlign: "left", marginBottom: "14px" }}
          >
            End-to-End Flow
          </h2>
          <p
            className="section-subtitle"
            style={{ textAlign: "left", marginBottom: 0 }}
          >
            From candidate strategy inputs to real-time exploration and live
            deployment.
          </p>
        </div>

        <div className="architecture-flow__grid">
          <div className="flow-card">
            <div className="flow-card__label">Inputs</div>
            <h3>Strategy Sources</h3>
            <p>
              Public and generated trading strategies enter the system as raw
              candidates for downstream evaluation.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div className="flow-card__label">Agent Layer</div>
            <h3>AI Evaluation</h3>
            <p>
              Agents classify, enrich, compare, and synthesize strategy signals
              before deeper indexing and ranking.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div className="flow-card__label">Retrieval Layer</div>
            <h3>FAISS Vector Search</h3>
            <p>
              High-dimensional vector indexing supports efficient similarity
              search across large candidate populations.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div className="flow-card__label">Tracking Layer</div>
            <h3>MHT Hypothesis Engine</h3>
            <p>
              Multiple Hypothesis Tracking evolves, prunes, and ranks competing
              paths through the strategy state space over time.
            </p>
            <a
              href="/decks/mht.html"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "18px",
                color: "#6fa8ff",
                textDecoration: "none",
              }}
            >
              Open the full MHT capability deck →
            </a>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "64px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "22px",
          }}
        >
          <div className="flow-card">
            <div className="flow-card__label">Interactive Layer</div>
            <h3>Exploration Surface</h3>
            <p>
              Users inspect rankings, branching paths, and candidate dynamics in
              a live environment connected to the research engine.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-card__label">Deployment Layer</div>
            <h3>Live Demo Surface</h3>
            <p>
              The architecture is exposed through a custom-domain demo that
              demonstrates the real system rather than a static mockup.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-card__label">Platform Role</div>
            <h3>Research to Product</h3>
            <p>
              The architecture bridges foundational research, deployable system
              design, and user-facing platform workflows such as QRLPhoenix.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: "64px",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          background: "#111827",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Why this architecture matters</h2>

        <p style={{ opacity: 0.88, maxWidth: "920px" }}>
          This stack is designed to turn advanced technical methods into usable
          infrastructure. Rather than isolating vector search, agent analysis,
          and tracking as separate ideas, IndustriallyStrong integrates them
          into one system that can support live exploration and future product
          workflows.
        </p>

        <ul style={{ opacity: 0.82, lineHeight: 1.8 }}>
          <li>Connects research methods directly to deployed systems</li>
          <li>Supports large candidate populations with practical retrieval</li>
          <li>Demonstrates implementation depth behind the platform surface</li>
          <li>Creates a foundation for future fintech intelligence systems</li>
        </ul>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <PrimaryButton to="/research">View research</PrimaryButton>
          <a
            href="https://demomhtfaiss.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              border: "1px solid #334155",
              borderRadius: "10px",
              textDecoration: "none",
              color: "white",
            }}
          >
            Launch live demo
          </a>
        </div>
      </section>
    </PageShell>
  );
}

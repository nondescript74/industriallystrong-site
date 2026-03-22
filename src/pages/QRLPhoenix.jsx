import PageShell from "../components/PageShell";

export default function QRLPhoenix() {
  return (
    <PageShell>
      <section style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>QRLPhoenix</h1>
        <p style={{ fontSize: "20px", maxWidth: "850px", opacity: 0.9 }}>
          An iOS strategy intelligence platform designed to discover, analyze,
          and organize trading strategies using AI-assisted workflows and
          research-driven infrastructure.
        </p>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>What it does</h2>
        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          QRLPhoenix is built to help evaluate publicly available and newly
          created trading strategies through a combination of AI analysis,
          structured review, and deeper technical filtering.
        </p>
        <ul style={{ opacity: 0.82 }}>
          <li>AI-assisted strategy discovery</li>
          <li>Structured analysis of candidate strategies</li>
          <li>iOS delivery surface for strategy intelligence</li>
          <li>Research integration with state resolution workflows</li>
        </ul>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>System architecture</h2>
        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          The platform combines a SwiftUI client, a Railway-hosted backend, AI
          model analysis, and research infrastructure for deeper strategy
          exploration.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>iOS client</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              SwiftUI application for user-facing strategy workflows.
            </p>
          </div>

          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>Backend</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              Railway-hosted service supporting analysis and orchestration.
            </p>
          </div>

          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>AI analysis</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              Model-driven review and enrichment of candidate strategies.
            </p>
          </div>

          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>Research layer</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              State resolution workflows support deeper exploration and ranking.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Status</h2>
        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          QRLPhoenix is available as both a native iOS application and a web
          platform, supported by a live backend and connected research systems.
        </p>
      </section>

      <section
        style={{
          border: "1px solid #B3905C",
          borderRadius: "14px",
          padding: "28px",
          background: "rgba(179, 144, 92, 0.06)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#B3905C" }}>Launch Phoenix Web</h2>
        <p style={{ opacity: 0.88, maxWidth: "900px", marginBottom: "16px" }}>
          Access the full QRL Phoenix platform in your browser — AI coaching,
          strategy discovery, IASG CTA analysis, batch evaluation, and
          blockchain-verified audit trails.
        </p>
        <a
          href="https://qrl-phoenix-web.pages.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#B3905C",
            color: "#001a36",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
          }}
        >
          Open Phoenix Web →
        </a>
      </section>
    </PageShell>
  );
}

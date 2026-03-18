import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";

export default function Decks() {
  return (
    <PageShell>
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>Decks</h1>

        <p style={{ fontSize: "20px", maxWidth: "860px", opacity: 0.9 }}>
          Presentation materials, capability decks, and technical briefings that
          support the systems and research surfaced across IndustriallyStrong.
        </p>
      </section>

      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          <a
            href="/decks/mht"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                padding: "22px",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                background: "#0f172a",
                transition: "transform 0.18s ease, border-color 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#1e293b";
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  marginBottom: "10px",
                }}
              >
                Capability Deck
              </div>

              <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
                Tracking Alpha in the Fog of Noise
              </h3>

              <p style={{ opacity: 0.82, margin: 0 }}>
                MHT, FAISS, asynchronous signal tracking, and the architecture
                behind the strategy intelligence engine.
              </p>
            </div>
          </a>

          <a
            href="/decks/gutsense"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                padding: "22px",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                background: "#0f172a",
                transition: "transform 0.18s ease, border-color 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#1e293b";
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  marginBottom: "10px",
                }}
              >
                Live Demo
              </div>

              <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
                GutSense — Multi-Agent FODMAP Analysis
              </h3>

              <p style={{ opacity: 0.82, margin: 0 }}>
                AI-powered IBS and FODMAP food analysis using Claude + Gemini
                agents with synthesis reconciliation. Web companion to the iOS app.
              </p>
            </div>
          </a>

          <CardLink to="/architecture" title="Architecture Overview">
            <p style={{ margin: 0 }}>
              System-level view of how applications, agent analysis, and the
              MHT-FAISS research engine connect into one platform.
            </p>
          </CardLink>

          <CardLink to="/research" title="Research Surface">
            <p style={{ margin: 0 }}>
              Research explanations, technical framing, and live demo access for
              the current MHT-FAISS system.
            </p>
          </CardLink>
        </div>
      </section>

      <section
        style={{
          marginTop: "56px",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          background: "#111827",
        }}
      >
        <h2 style={{ marginTop: 0 }}>What comes next</h2>

        <p style={{ opacity: 0.88, maxWidth: "920px" }}>
          This page becomes the home for future technical briefings: QRLPhoenix,
          GutSense, program concepts, and deeper research artifacts that support
          live systems and platform strategy.
        </p>

        <ul style={{ opacity: 0.82, lineHeight: 1.8 }}>
          <li>QRLPhoenix architecture deck</li>
          <li>GutSense deep-dive architecture deck</li>
          <li>DARPA-style concept brief</li>
          <li>Future research and demo walkthroughs</li>
        </ul>
      </section>
    </PageShell>
  );
}

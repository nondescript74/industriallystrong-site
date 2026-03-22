import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";

export default function Programs() {
  return (
    <PageShell>
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>Programs</h1>

        <p style={{ fontSize: "20px", maxWidth: "900px", opacity: 0.9 }}>
          IndustriallyStrong develops initiative tracks that connect research,
          systems, and technical architecture to larger deployment pathways.
          These programs are framed as directional efforts rather than isolated
          projects.
        </p>
      </section>

      <section style={{ marginBottom: "56px" }}>
        <h2 style={{ marginBottom: "24px" }}>Program Tracks</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          <div
            className="structure-card"
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
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
              Program Track 01
            </div>

            <h3 style={{ marginTop: 0 }}>DARPA-Style Technical Programs</h3>

            <p style={{ opacity: 0.85 }}>
              Mission-oriented technical initiatives framed around high-risk,
              high-payoff architectures. These efforts emphasize discontinuous
              capability, selective disclosure, and execution by institutions
              capable of operating at national or strategic scale.
            </p>

            <ul style={{ opacity: 0.82, lineHeight: 1.8, paddingLeft: "18px" }}>
              <li>Problem-first framing</li>
              <li>High-consequence technical directions</li>
              <li>Research to architecture translation</li>
              <li>Institutional execution model</li>
            </ul>
          </div>

          <div
            className="structure-card"
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
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
              Program Track 02
            </div>

            <h3 style={{ marginTop: 0 }}>Fintech Infrastructure Programs</h3>

            <p style={{ opacity: 0.85 }}>
              Applied intelligence systems focused on strategy discovery,
              agent-driven evaluation, resilient market analysis, and research
              methods that can become deployable technical platforms.
            </p>

            <ul style={{ opacity: 0.82, lineHeight: 1.8, paddingLeft: "18px" }}>
              <li>Strategy intelligence systems</li>
              <li>Agent-assisted evaluation workflows</li>
              <li>State resolution research infrastructure</li>
              <li>Deployable product-oriented architecture</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "56px" }}>
        <h2 style={{ marginBottom: "24px" }}>Program Surface</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "22px",
          }}
        >
          <CardLink to="/architecture" title="Architecture">
            <p style={{ margin: 0 }}>
              System-level view of how applications, agent workflows, and
              research infrastructure connect into one stack.
            </p>
          </CardLink>

          <CardLink to="/research" title="Research">
            <p style={{ margin: 0 }}>
              Technical explanations, live demo access, and the research
              substrate behind current systems.
            </p>
          </CardLink>

          <CardLink to="/decks" title="Decks">
            <p style={{ margin: 0 }}>
              Capability decks and briefing artifacts for communicating systems,
              methods, and program direction.
            </p>
          </CardLink>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          background: "#111827",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Why Programs Matter</h2>

        <p style={{ opacity: 0.88, maxWidth: "920px" }}>
          Programs provide the missing layer between isolated technical work and
          larger strategic direction. They make clear how research systems,
          product systems, and live demonstrations fit into broader initiative
          pathways.
        </p>

        <ul style={{ opacity: 0.82, lineHeight: 1.8 }}>
          <li>Connect systems to larger strategic intent</li>
          <li>Frame future work without over-disclosing implementation detail</li>
          <li>Present research and product efforts as coherent initiative tracks</li>
          <li>Support deeper partner, investor, or institutional conversations</li>
        </ul>
      </section>
    </PageShell>
  );
}

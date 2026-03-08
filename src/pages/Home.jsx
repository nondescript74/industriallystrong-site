import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";
import PrimaryButton from "../components/PrimaryButton";

export default function Home() {
  return (
    <PageShell>
      <div>

        {/* HERO */}

        <section
          style={{
            padding: "96px 0 72px 0",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.7,
              marginBottom: "18px",
            }}
          >
            IndustriallyStrong
          </div>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.05,
              margin: "0 0 20px 0",
              maxWidth: "980px",
            }}
          >
            Building AI systems, research engines, and technical platforms.
          </h1>

          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.6,
              maxWidth: "900px",
              opacity: 0.9,
              marginBottom: "32px",
            }}
          >
            IndustriallyStrong connects program concepts, deployed systems,
            and research architecture across fintech, multi-agent AI,
            and advanced technical infrastructure.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <PrimaryButton href="/systems">
              View systems
            </PrimaryButton>

            <PrimaryButton href="/research">
              Explore research
            </PrimaryButton>
          </div>
        </section>

        {/* LIVE SYSTEMS */}

        <section style={{ padding: "72px 0" }}>
          <h2 style={{ fontSize: "34px", marginBottom: "24px" }}>
            Live systems
          </h2>

          <p
            style={{
              fontSize: "18px",
              maxWidth: "820px",
              opacity: 0.9,
              marginBottom: "36px",
            }}
          >
            These systems are not conceptual prototypes. They represent
            working architectures deployed across real infrastructure and
            accessible through live demos and applications.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            <CardLink
              title="MHT-FAISS Strategy Engine"
              description="Real-time research system exploring large strategy populations using vector search and multiple hypothesis tracking."
              href="https://demomhtfaiss.industriallystrong.com"
            />

            <CardLink
              title="QRLPhoenix"
              description="AI-assisted platform for discovering and analyzing publicly available trading strategies."
              href="/systems/qrlphoenix"
            />

            <CardLink
              title="GutSense"
              description="Multi-agent dietary intelligence system integrating Claude, Gemini, and on-device Apple models."
              href="/systems/gutsense"
            />
          </div>
        </section>

        {/* RESEARCH SURFACE */}

        <section
          style={{
            padding: "72px 0",
            borderTop: "1px solid #1e293b",
          }}
        >
          <h2 style={{ fontSize: "34px", marginBottom: "20px" }}>
            Research architecture
          </h2>

          <p
            style={{
              fontSize: "18px",
              maxWidth: "860px",
              opacity: 0.9,
              marginBottom: "32px",
            }}
          >
            Research work focuses on turning advanced technical methods
            into deployable systems. The MHT-FAISS engine demonstrates
            how tracking algorithms, vector search, and agent analysis
            can become practical infrastructure for strategy discovery.
          </p>

          <PrimaryButton href="/research">
            View research architecture
          </PrimaryButton>
        </section>

      </div>
    </PageShell>
  );
}

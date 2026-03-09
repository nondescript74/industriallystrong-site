import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";
import PrimaryButton from "../components/PrimaryButton";
import { trackEvent } from "../utils/analytics";
import LiveMetricsCard from "../components/LiveMetricsCard";

export default function Home() {
  return (
    <PageShell>
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
          Building AI systems, research engines, and deployable technical platforms.
        </h1>

        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.6,
            maxWidth: "900px",
            opacity: 0.9,
            marginBottom: "28px",
          }}
        >
          IndustriallyStrong connects program concepts, deployed systems, and
          research architecture across fintech, multi-agent AI, and advanced
          technical infrastructure.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <PrimaryButton to="/systems" eventLabel="open_systems">
            View systems
          </PrimaryButton>

          <PrimaryButton to="/research" secondary eventLabel="open_research">
            Explore research
          </PrimaryButton>

          <PrimaryButton to="/architecture" eventLabel="open_architecture">
            Explore Architecture
          </PrimaryButton>
        </div>
      </section>

      {/* Platform Flow */}

      <section className="architecture-flow">
        <div className="architecture-flow__intro">
          <h2
            className="section-title"
            style={{ textAlign: "left", marginBottom: "14px" }}
          >
            Platform Flow
          </h2>

          <p
            className="section-subtitle"
            style={{ textAlign: "left", marginBottom: "0" }}
          >
            Applications, agent analysis, and research infrastructure operate as
            one connected stack.
          </p>
        </div>

        <div className="architecture-flow__grid">

          <div className="flow-card">
            <div className="flow-card__label">Applications</div>
            <h3>QRLPhoenix + GutSense</h3>
            <p>
              User-facing systems for strategy intelligence and dietary decision
              support.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div className="flow-card__label">Agent Layer</div>
            <h3>AI Analysis + Synthesis</h3>
            <p>
              Agents classify, enrich, compare, and synthesize candidate
              strategies and decision signals.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div className="flow-card__label">Research Engine</div>
            <h3>MHT-FAISS Core</h3>
            <p>
              High-dimensional search, ranking, and multiple-hypothesis
              tracking across large candidate populations.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div className="flow-card__label">Live Surface</div>
            <h3>Interactive Demo</h3>
            <p>
              Research results become explorable through live deployment under
              your own domain.
            </p>
          </div>

        </div>
      </section>

      {/* Program Structure */}

      <section className="program-structure">
        <div className="container">

          <h2 className="section-title">Program Structure</h2>

          <p className="section-subtitle">
            From foundational research to deployed systems and live demonstrations.
          </p>

          <div className="structure-grid">

            <div className="structure-card">
              <h3>Research</h3>
              <p>
                Foundational work on high-dimensional signal processing,
                hypothesis tracking, and associative retrieval methods.
              </p>

              <a
                href="/research"
                className="structure-link"
                onClick={() => trackEvent("navigation","open_research")}
              >
                View Research →
              </a>
            </div>

            <div className="structure-card">
              <h3>Systems</h3>
              <p>
                Production architectures that operationalize research results,
                including QRLPhoenix and FAISS-based inference pipelines.
              </p>

              <a
                href="/systems"
                className="structure-link"
                onClick={() => trackEvent("navigation","open_systems")}
              >
                View Systems →
              </a>
            </div>

            <div className="structure-card">
              <h3>Live Demonstrations</h3>

              <p>
                Interactive deployments illustrating system behavior and
                architectural performance in real environments.
              </p>

              <a
                href="https://demomhtfaiss.industriallystrong.com"
                className="structure-link"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("navigation","launch_live_demo")}
              >
                Launch Demo →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Live Systems */}

      <section style={{ marginTop: "72px" }}>

        <h2 style={{ marginBottom: "28px" }}>Live Systems</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "22px",
          }}
        >

          <a
            href="https://demomhtfaiss.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("navigation","launch_live_demo")}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <h3>MHT-FAISS Demo</h3>
              <p style={{ margin: 0 }}>
                Interactive research surface exploring strategy candidate
                populations using vector search and hypothesis tracking.
              </p>
            </div>
          </a>

          <a
            href="https://industriallystrong.com/decks/mht.html"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("navigation","open_mht_deck")}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <h3>MHT Capability Deck</h3>
              <p style={{ margin: 0 }}>
                Full explanation of asynchronous signal tracking, ANN filtering,
                and the architecture behind the system.
              </p>
            </div>
          </a>

          <CardLink to="/systems/qrlphoenix" title="QRLPhoenix">
            <p style={{ margin: 0 }}>
              AI-assisted strategy discovery and evaluation platform connected
              to the research engine and agent analysis workflows.
            </p>
          </CardLink>

        </div>

      </section>

      {/* Core Systems */}

      <section style={{ marginTop: "72px" }}>

        <h2 style={{ marginBottom: "28px" }}>Core Systems</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "22px",
          }}
        >

          <CardLink to="/systems/qrlphoenix" title="QRLPhoenix">
            <p style={{ margin: 0 }}>
              AI-assisted iOS strategy discovery and evaluation platform.
            </p>
          </CardLink>

          <CardLink to="/systems/gutsense" title="GutSense">
            <p style={{ margin: 0 }}>
              Multi-agent dietary intelligence using Claude, Gemini, and Apple
              Foundation Models.
            </p>
          </CardLink>

          <CardLink to="/research" title="MHT-FAISS Engine">
            <p style={{ margin: 0 }}>
              Research infrastructure for exploring large candidate strategy
              populations.
            </p>
          </CardLink>

        </div>

      </section>
      <LiveMetricsCard />
    </PageShell>
  );
}

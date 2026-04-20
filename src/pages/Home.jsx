import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";
import PrimaryButton from "../components/PrimaryButton";
import LiveMetricsCard from "../components/LiveMetricsCard";
import { trackEvent } from "../utils/analytics";
import { sendTelemetry } from "../utils/telemetry";

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
            fontSize: "44px",
            lineHeight: 1.15,
            margin: "0 0 18px 0",
            maxWidth: "980px",
          }}
        >
          AI systems can produce convincing reasoning without guaranteeing
          correct decisions.
        </h1>

        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.55,
            maxWidth: "900px",
            opacity: 0.9,
            marginBottom: "18px",
          }}
        >
          This platform demonstrates where that fails — and shows the
          deterministic decision structures required to replace it.
        </p>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.55,
            maxWidth: "900px",
            opacity: 0.85,
            marginBottom: "14px",
          }}
        >
          See the proof live:{" "}
          <a
            href="https://compare.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent("navigation", "launch_correctness_comparator_hero");
              sendTelemetry({
                app: "industriallystrong",
                lane: "general",
                eventType: "outbound_click",
                metadata: {
                  label: "s02_correctness_comparator_hero",
                  href: "https://compare.industriallystrong.com",
                  section: "hero",
                },
              });
            }}
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            compare.industriallystrong.com
          </a>{" "}
          — deterministic vs heuristic reconstruction under adversarial
          conditions.
        </p>

        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.55,
            maxWidth: "900px",
            opacity: 0.78,
            marginBottom: "28px",
          }}
        >
          This is systems architecture work — defining what holds under
          failure, not just what works under normal conditions.
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
            <h3>State Resolution Core</h3>
            <p>
              High-dimensional search, ranking, and multi-state
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

      <section className="program-structure">
        <div className="container">
          <h2 className="section-title">Program Structure</h2>

          <p className="section-subtitle">
            From foundational research to deployed systems and live
            demonstrations.
          </p>

          <div className="structure-grid">
            <div className="structure-card">
              <h3>Research</h3>
              <p>
                Foundational work on high-dimensional signal processing,
                candidate state tracking, and associative retrieval methods.
              </p>

              <a
                href="/research"
                className="structure-link"
                onClick={() => {
                  trackEvent("navigation", "open_research");
                  sendTelemetry({
                    app: "industriallystrong",
                    lane: "general",
                    eventType: "lab_card_click",
                    route: "/research",
                    metadata: {
                      label: "view_research",
                      href: "/research",
                      section: "program_structure",
                    },
                  });
                }}
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
                onClick={() => {
                  trackEvent("navigation", "open_systems");
                  sendTelemetry({
                    app: "industriallystrong",
                    lane: "general",
                    eventType: "lab_card_click",
                    route: "/systems",
                    metadata: {
                      label: "view_systems",
                      href: "/systems",
                      section: "program_structure",
                    },
                  });
                }}
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
                onClick={() => {
                  trackEvent("navigation", "launch_live_demo");
                  sendTelemetry({
                    app: "industriallystrong",
                    lane: "general",
                    eventType: "outbound_click",
                    metadata: {
                      label: "launch_live_demo",
                      href: "https://demomhtfaiss.industriallystrong.com",
                      section: "program_structure",
                    },
                  });
                }}
              >
                Launch Demo →
              </a>
            </div>
          </div>
        </div>
      </section>

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
            href="https://compare.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent("navigation", "launch_correctness_comparator");
              sendTelemetry({
                app: "industriallystrong",
                lane: "general",
                eventType: "outbound_click",
                metadata: {
                  label: "s02_correctness_comparator",
                  href: "https://compare.industriallystrong.com",
                  section: "live_systems",
                },
              });
            }}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <h3>S02 Correctness Comparator</h3>
              <p style={{ margin: 0 }}>
                Interactive proof surface demonstrating where deterministic
                reconstruction succeeds and heuristic reconciliation fails
                across storage, tape, and semiconductor scenarios.
              </p>
            </div>
          </a>

          <a
            href="https://demomhtfaiss.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent("navigation", "launch_live_demo");
              sendTelemetry({
                app: "industriallystrong",
                lane: "general",
                eventType: "outbound_click",
                metadata: {
                  label: "state_resolution_demo",
                  href: "https://demomhtfaiss.industriallystrong.com",
                  section: "live_systems",
                },
              });
            }}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <h3>State Resolution Demo</h3>
              <p style={{ margin: 0 }}>
                Interactive research surface exploring strategy candidate
                populations using vector search and state tracking.
              </p>
            </div>
          </a>

          <a
            href="/decks/mht"
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent("navigation", "open_mht_deck");
              sendTelemetry({
                app: "industriallystrong",
                lane: "general",
                eventType: "outbound_click",
                metadata: {
                  label: "open_mht_deck",
                  href: "/decks/mht",
                  section: "live_systems",
                },
              });
            }}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <h3>MHT Capability Deck</h3>
              <p style={{ margin: 0 }}>
                Full explanation of asynchronous signal tracking, ANN
                filtering, and the architecture behind the system.
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

          <CardLink to="/research" title="State Resolution Engine">
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

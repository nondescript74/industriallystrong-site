import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import "../assets/systemsPage.css";

function SystemCard({ title, subtitle, description, evidence, to, href }) {
  const linkTarget = to || href;
  const card = (
    <div className="systems-card" style={linkTarget ? { cursor: "pointer" } : {}}>
      <div className="systems-card-top">
        <h3>{title}</h3>
        <div className="systems-subtitle">{subtitle}</div>
      </div>

      <p className="systems-description">{description}</p>

      <div className="systems-evidence">
        <span>System evidence</span>
        <strong>{evidence}</strong>
      </div>

      {linkTarget && (
        <div style={{
          marginTop: "12px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#5B8DEF",
          letterSpacing: "0.02em",
        }}>
          View system →
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>{card}</Link>;
  }
  if (href) {
    return <a href={href} style={{ textDecoration: "none", color: "inherit" }}>{card}</a>;
  }
  return card;
}

export default function Systems() {
  return (
    <PageShell>
      <main className="systems-page">
        <section className="systems-hero">
          <div className="systems-hero-inner">
            <div className="systems-eyebrow">Systems</div>
            <h1>Working systems that make the architecture real.</h1>
            <p className="systems-hero-copy">
              IndustriallyStrong develops systems as real technical artifacts:
              operational platforms, research engines, and implemented tools
              that demonstrate how architectural ideas become usable systems.
            </p>
          </div>
        </section>

        <section className="systems-section">
          <div className="systems-section-inner">
            <div className="systems-eyebrow">What systems mean here</div>
            <h2>Not mockups. Not concept sketches. Working technical artifacts.</h2>
            <p className="systems-copy">
              Systems on this platform are the evidence layer. They show that
              the work is not limited to conceptual framing, but extends into
              implementation, experimentation, integration, and deployment.
            </p>

            <div className="systems-definition-grid">
              <div className="systems-definition-block">
                <h3>Operational</h3>
                <p>
                  Systems are intended to function as tools, platforms, or real
                  working components rather than static demonstrations.
                </p>
              </div>

              <div className="systems-definition-block">
                <h3>Architectural</h3>
                <p>
                  Each system embodies a broader architectural direction, not
                  just a narrow feature implementation.
                </p>
              </div>

              <div className="systems-definition-block">
                <h3>Evidence-generating</h3>
                <p>
                  Systems generate feedback, performance data, and practical
                  constraints that strengthen or refine the underlying concepts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="systems-section">
          <div className="systems-section-inner">
            <div className="systems-eyebrow">Featured systems</div>
            <h2>Operational expressions of the platform’s research directions.</h2>

            <div className="systems-grid">
              <SystemCard
                title="QRLPhoenix"
                subtitle="AI-assisted strategy discovery platform"
                description="A working platform focused on strategy discovery, evaluation, and decision-support workflows. It reflects the site’s interest in transparent intelligence, structured reasoning, and practical system usability."
                evidence="Deployed platform for strategy discovery and analysis"
                to="/systems/qrlphoenix"
              />

              <SystemCard
                title="GutSense"
                subtitle="Multi-agent dietary intelligence system"
                description="A system built around multiple agents, domain-specific reasoning, and applied intelligence workflows. It demonstrates how specialized agents can collaborate within a usable operating surface."
                evidence="Working multi-agent application with domain focus"
                to="/systems/gutsense"
              />

              <SystemCard
                title="State Resolution Engine"
                subtitle="Research engine for candidate state tracking and retrieval"
                description="A research-oriented system connecting multi-state reasoning with high-dimensional retrieval. It serves as an evidence layer for the platform’s broader work in structured intelligence and strategy tracking."
                evidence="Research engine supporting technical experimentation"
                href="/decks/mht"
              />
            </div>
          </div>
        </section>

        <section className="systems-section">
          <div className="systems-section-inner">
            <div className="systems-eyebrow">System logic</div>
            <h2>Concepts generate architecture. Architecture produces systems. Systems generate evidence.</h2>

            <div className="systems-flow">
              <div className="systems-flow-node">
                <h3>Concepts</h3>
                <p>
                  Initial theses about structure, scaling, resilience, and
                  technical direction.
                </p>
              </div>

              <div className="systems-flow-arrow">→</div>

              <div className="systems-flow-node">
                <h3>Architecture</h3>
                <p>
                  System design, technical framing, component interaction, and
                  implementation logic.
                </p>
              </div>

              <div className="systems-flow-arrow">→</div>

              <div className="systems-flow-node">
                <h3>Systems</h3>
                <p>
                  Working platforms, tools, and research engines that embody the
                  architecture.
                </p>
              </div>

              <div className="systems-flow-arrow">→</div>

              <div className="systems-flow-node">
                <h3>Evidence</h3>
                <p>
                  Real performance, usability, feedback, and constraints that
                  sharpen the next iteration.
                </p>
              </div>
            </div>

            <p className="systems-summary">
              This platform is designed to connect thought and execution. The
              systems are where ideas encounter practical reality.
            </p>
          </div>
        </section>

        <section className="systems-section">
          <div className="systems-section-inner">
            <div className="systems-eyebrow">Architectural continuity</div>
            <h2>The systems reflect the same values as the concepts.</h2>

            <div className="systems-values-grid">
              <div className="systems-value-card">
                <h3>Transparency</h3>
                <p>
                  Systems should expose reasoning structure, uncertainty, and
                  evidence rather than hide them.
                </p>
              </div>

              <div className="systems-value-card">
                <h3>Resilience</h3>
                <p>
                  Systems should remain useful under imperfect information,
                  changing conditions, and real operational constraints.
                </p>
              </div>

              <div className="systems-value-card">
                <h3>Usability</h3>
                <p>
                  Research is most valuable when it can be shaped into systems
                  that people can actually use.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="systems-closing">
          <div className="systems-closing-inner">
            <div className="systems-eyebrow">Closing statement</div>
            <h2>
              IndustriallyStrong treats systems as proof: evidence that
              architectural thinking can be translated into functioning
              platforms, research engines, and deployable technical tools.
            </h2>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

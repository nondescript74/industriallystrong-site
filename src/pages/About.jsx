import PageShell from "../components/PageShell";
import "../assets/aboutPage.css";

function FocusCard({ title, children }) {
  return (
    <div className="about-card">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function SystemCard({ title, children }) {
  return (
    <div className="about-system-card">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export default function About() {
  return (
    <PageShell>
      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-inner">
            <div className="about-eyebrow">About IndustriallyStrong</div>
            <h1>Industrial systems architecture and research platform</h1>
            <p className="about-hero-copy">
              IndustriallyStrong is a research platform exploring new technical
              architectures — from AI systems to semiconductor fabrication
              concepts.
            </p>
            <p className="about-hero-copy secondary">
              The site connects ideas, systems, and working implementations,
              showing how research directions evolve into deployable
              technology.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-eyebrow">What this platform does</div>
            <h2>Architectural thinking, research systems, and concept-to-system demonstrations.</h2>

            <div className="about-pillars">
              <div className="about-pillar">
                <div className="pillar-icon">01</div>
                <h3>Technical architecture exploration</h3>
                <p>
                  Framing and testing new systems-level directions across AI,
                  software, and emerging technical platforms.
                </p>
              </div>

              <div className="about-pillar">
                <div className="pillar-icon">02</div>
                <h3>Research system development</h3>
                <p>
                  Building experimental systems that move ideas beyond theory
                  into functioning technical artifacts.
                </p>
              </div>

              <div className="about-pillar">
                <div className="pillar-icon">03</div>
                <h3>Concept-to-system demonstrations</h3>
                <p>
                  Showing how concepts evolve into real architectures, tools,
                  and operational systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-eyebrow">Current focus areas</div>
            <h2>Research directions across intelligent systems and new technical architectures.</h2>

            <div className="about-card-grid">
              <FocusCard title="AI System Architectures">
                Designing decision systems built from coordinated agents,
                structured reasoning, and real-world data pipelines.
              </FocusCard>

              <FocusCard title="Strategy Discovery Platforms">
                Research into automated discovery and evaluation of complex
                strategies using statistical signal processing and
                multi-state resolution frameworks.
              </FocusCard>

              <FocusCard title="Multi-Agent Systems">
                Experimental environments where specialized AI agents
                collaborate to solve domain-specific problems.
              </FocusCard>

              <FocusCard title="Emerging Computational Architectures">
                Exploration of new system architectures, including programmable
                semiconductor platforms and distributed computational models.
              </FocusCard>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-eyebrow">Platform model</div>
            <h2>How the work moves from concept to system.</h2>

            <div className="about-flow">
              <div className="about-flow-node">
                <h3>Concepts</h3>
                <p>
                  New architectures, system theses, and technical investigations.
                </p>
              </div>

              <div className="about-flow-arrow">→</div>

              <div className="about-flow-node">
                <h3>Research Systems</h3>
                <p>
                  Experimental platforms that test architecture, integration,
                  and performance in practice.
                </p>
              </div>

              <div className="about-flow-arrow">→</div>

              <div className="about-flow-node">
                <h3>Operational Platforms</h3>
                <p>
                  Deployed software and real systems derived from validated
                  research directions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-eyebrow">Current systems</div>
            <h2>Working systems that illustrate the approach.</h2>

            <div className="about-systems-grid">
              <SystemCard title="QRLPhoenix">
                AI-assisted strategy discovery platform.
              </SystemCard>

              <SystemCard title="GutSense">
                Multi-agent dietary intelligence system.
              </SystemCard>

              <SystemCard title="State Resolution Engine">
                Research platform for strategy tracking using multi-state
                resolution frameworks and vector retrieval.
              </SystemCard>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-inner">
            <div className="about-eyebrow">Approach</div>
            <h2>Integrated concept development, research prototypes, and operational systems.</h2>

            <div className="about-approach-grid">
              <div className="approach-block">
                <h3>Concept development</h3>
                <p>New architectures and system ideas.</p>
              </div>

              <div className="approach-block">
                <h3>Research prototypes</h3>
                <p>Working experimental platforms.</p>
              </div>

              <div className="approach-block">
                <h3>Operational systems</h3>
                <p>Real deployments and applications.</p>
              </div>
            </div>

            <p className="about-approach-summary">
              The goal is to explore how ideas move from technical concept to
              research system to deployed technology.
            </p>
          </div>
        </section>

        <section className="about-closing">
          <div className="about-closing-inner">
            <div className="about-eyebrow">Closing statement</div>
            <h2>
              IndustriallyStrong is an independent technical platform focused on
              systems architecture, research experimentation, and advanced
              technology development.
            </h2>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

import "./index.css";

const ideas = [
  {
    title: "Program Concepts",
    text: "A portfolio of high-consequence technical concepts aimed at institutional execution rather than solo commercialization.",
  },
  {
    title: "DARPA-Class Framing",
    text: "Mission-first, problem-first, capability-oriented articulation of disruptive ideas that demand multidisciplinary execution.",
  },
  {
    title: "Fintech Infrastructure",
    text: "Systems concepts focused on resilient intelligence, decision support, and next-generation market infrastructure.",
  },
  {
    title: "Thought Leadership",
    text: "A visible professional identity that attracts the right technical, strategic, and institutional conversations.",
  },
];

const focusAreas = [
  "Adaptive technical architectures",
  "High-risk / high-payoff programs",
  "Semiconductor and photonics concepts",
  "AI resilience and transparency",
  "Fintech systems and market intelligence",
  "Program formation and strategic narrative",
];

export default function App() {
  return (
    <div className="site-shell">
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Industrially Strong · Demo Concept</div>
            <h1>Program concepts for organizations built to execute at scale.</h1>
            <p className="hero-text">
              IndustriallyStrong is a strategic portal for framing advanced technical ideas,
              attracting the right conversations, and positioning disruptive concepts for
              institutional execution across defense-class research and fintech infrastructure.
            </p>
            <div className="hero-actions">
              <a href="#mission" className="btn btn-primary">Explore mission</a>
              <a href="#concepts" className="btn btn-secondary">Review concepts</a>
            </div>
          </div>

          <div className="panel">
            <div className="panel-label">Core thesis</div>
            <h2>
              Not a product pitch. A platform for originating and communicating high-impact programs.
            </h2>
            <p>
              The site functions as the front door for technical narrative, strategic credibility,
              and program formation.
            </p>
            <p>
              One concept class is framed for DARPA-style, high-risk / high-payoff exploration.
              Another targets resilient fintech systems.
            </p>
          </div>
        </div>
      </section>

      <section id="mission" className="section">
        <div className="container two-col">
          <div>
            <div className="section-label">Mission framing</div>
            <h3>Problem-first positioning for serious technical audiences.</h3>
            <p className="section-text">
              The objective is to articulate advanced concepts in a form that resonates with
              decision-makers who evaluate strategic relevance, technical novelty, execution
              feasibility, and institutional fit.
            </p>
          </div>

          <div className="cards-grid">
            {ideas.map((item) => (
              <div key={item.title} className="card">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="concepts" className="section section-alt">
        <div className="container two-col">
          <div>
            <div className="section-label section-label-green">Operating domains</div>
            <h3>Current fronts of exploration.</h3>
            <p className="section-text">
              A demo landing page should quickly establish the technical surface area without
              disclosing sensitive implementation detail. The point is to attract the right next conversation.
            </p>
          </div>

          <div className="focus-grid">
            {focusAreas.map((item) => (
              <div key={item} className="focus-item">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container three-col">
          <div className="callout callout-cyan">
            <div className="callout-label">For program sponsors</div>
            <h4>See the strategic problem space.</h4>
            <p>
              Understand the mission relevance, discontinuity, and why conventional approaches are insufficient.
            </p>
          </div>

          <div className="callout callout-green">
            <div className="callout-label">For technical leaders</div>
            <h4>Assess novelty and execution shape.</h4>
            <p>
              Evaluate whether the concept demands multidisciplinary build capability, advanced research, or architecture leadership.
            </p>
          </div>

          <div className="callout callout-violet">
            <div className="callout-label">For collaborators</div>
            <h4>Enter the conversation with context.</h4>
            <p>
              Use the site as a concise narrative anchor before deeper discussions, briefs, or concept notes are exchanged.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-bottom">
        <div className="container closing">
          <div>
            <div className="panel-label">Demo closing section</div>
            <h3>Framing ideas that deserve institutional execution.</h3>
            <p className="section-text">
              This demo site is designed to support a next-step evolution of IndustriallyStrong:
              clearer strategic intent, stronger DARPA-class and fintech positioning, and a cleaner
              path from interest to serious dialogue.
            </p>
          </div>

          <div className="panel small-panel">
            <div className="panel-label">Suggested CTA direction</div>
            <ul className="cta-list">
              <li>Review concept briefs</li>
              <li>Explore current domains</li>
              <li>Start a strategic conversation</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );


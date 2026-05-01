import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";
import PrimaryButton from "../components/PrimaryButton";
import LiveMetricsCard from "../components/LiveMetricsCard";
import { trackEvent } from "../utils/analytics";
import { sendTelemetry } from "../utils/telemetry";

// Map nav-IA paths to in-page section anchors so /leadership, /operating-model
// and /evidence scroll to the matching section on Home.
const PATH_TO_SECTION = {
  "/leadership": "leadership-evidence",
  "/operating-model": "operating-model",
  "/evidence": "evidence",
};

// Style helpers reused across this page
const proofStripStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "20px",
  marginTop: "40px",
  marginBottom: "32px",
  padding: "24px 28px",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  background: "rgba(15, 23, 42, 0.55)",
};

const proofNumberStyle = {
  fontSize: "30px",
  fontWeight: 800,
  letterSpacing: "-0.01em",
  lineHeight: 1.05,
  color: "#f5f7fa",
};

const proofLabelStyle = {
  marginTop: "6px",
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  opacity: 0.7,
};

const evidenceCardStyle = {
  background: "#161a22",
  padding: "30px",
  borderRadius: "12px",
  border: "1px solid #1e293b",
  transition: "transform 0.2s ease, border-color 0.2s ease",
  textDecoration: "none",
  color: "inherit",
  display: "block",
};

const evidenceLabelStyle = {
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#7dd3fc",
  fontWeight: 600,
  marginBottom: "10px",
};

const evidenceTitleStyle = {
  fontSize: "1.15rem",
  margin: "0 0 12px 0",
  lineHeight: 1.3,
};

const operatingCardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderLeft: "3px solid #38bdf8",
  borderRadius: "10px",
  padding: "22px 24px",
};

const operatingLabelStyle = {
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#94a3b8",
  fontWeight: 600,
  marginBottom: "8px",
};

const operatingBodyStyle = {
  margin: 0,
  fontSize: "15px",
  lineHeight: 1.55,
  opacity: 0.92,
};

const sectionWrap = (extra = {}) => ({
  marginTop: "72px",
  paddingTop: "8px",
  ...extra,
});

const sectionEyebrowStyle = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#7dd3fc",
  marginBottom: "10px",
  fontWeight: 600,
};

const sectionHeadingStyle = {
  fontSize: "32px",
  margin: "0 0 12px 0",
  lineHeight: 1.2,
};

const sectionLeadStyle = {
  fontSize: "17px",
  lineHeight: 1.65,
  opacity: 0.85,
  maxWidth: "880px",
  marginBottom: "32px",
};

const Z_BASE = "https://z.industriallystrong.com";

export default function Home() {
  const location = useLocation();

  // When entering Home via /leadership, /operating-model, or /evidence,
  // scroll to the corresponding section. Plain "/" leaves scroll at top.
  useEffect(() => {
    const sectionId = PATH_TO_SECTION[location.pathname];
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    // Allow the page to render before scrolling.
    const t = window.setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return (
    <PageShell>
      {/* 1. HERO — engineering executive / systems architect / builder */}
      <section
        style={{
          padding: "96px 0 72px 0",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: "20px",
            color: "#7dd3fc",
            fontWeight: 600,
          }}
        >
          Engineering Executive · Global R&D · Program Leadership · Systems Architecture
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 22px 0",
            maxWidth: "1000px",
          }}
        >
          Leading Complex Engineering Systems
        </h1>

        <p
          style={{
            fontSize: "21px",
            lineHeight: 1.6,
            maxWidth: "920px",
            opacity: 0.92,
            marginBottom: "10px",
          }}
        >
          I lead engineering organizations where architecture, execution
          discipline, and real-world constraints have to converge — global
          teams, acquisition integration, AI systems, infrastructure, AI
          decision systems, and physical-domain platforms.
        </p>

        <p
          style={{
            fontSize: "15px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginTop: "26px",
            marginBottom: "0",
          }}
        >
          Look what I led — and I still build.
        </p>

        {/* Proof strip — five quantitative anchors */}
        <div style={proofStripStyle}>
          <div>
            <div style={proofNumberStyle}>$150M+</div>
            <div style={proofLabelStyle}>R&D Managed</div>
          </div>
          <div>
            <div style={proofNumberStyle}>65+</div>
            <div style={proofLabelStyle}>Global Team</div>
          </div>
          <div>
            <div style={proofNumberStyle}>40+</div>
            <div style={proofLabelStyle}>Concurrent Projects</div>
          </div>
          <div>
            <div style={proofNumberStyle}>30+</div>
            <div style={proofLabelStyle}>Engineers Integrated</div>
          </div>
          <div>
            <div style={proofNumberStyle}>7+ US Patents</div>
            <div style={proofLabelStyle}>Granted</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
          <a
            href="#leadership-evidence"
            onClick={() =>
              trackEvent("navigation", "view_leadership_evidence_hero")
            }
            style={{
              display: "inline-block",
              padding: "12px 22px",
              borderRadius: "8px",
              background: "#38bdf8",
              color: "#08131f",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            View Leadership Evidence →
          </a>

          <a
            href="#builder-layer"
            onClick={() => trackEvent("navigation", "view_builder_layer_hero")}
            style={{
              display: "inline-block",
              padding: "12px 22px",
              borderRadius: "8px",
              background: "transparent",
              color: "#f5f7fa",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textDecoration: "none",
              border: "1px solid #334155",
            }}
          >
            View Builder Layer
          </a>

          <PrimaryButton to="/contact" secondary eventLabel="hero_open_contact">
            Contact
          </PrimaryButton>
        </div>
      </section>

      {/* 2. LEADERSHIP EVIDENCE */}
      <section id="leadership-evidence" style={sectionWrap()}>
        <div style={sectionEyebrowStyle}>01 — Leadership Evidence</div>
        <h2 style={sectionHeadingStyle}>What I have led</h2>
        <p style={sectionLeadStyle}>
          The first-order signal is not only that I build systems. It is that I
          have led teams, programs, integrations, and portfolio decisions where
          execution discipline mattered.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          <a
            href={`${Z_BASE}/pmp-story.html`}
            target="_blank"
            rel="noreferrer"
            style={evidenceCardStyle}
            onClick={() =>
              trackEvent("leadership_evidence", "open_pmp_story")
            }
          >
            <div style={evidenceLabelStyle}>Scale Program Execution</div>
            <h3 style={evidenceTitleStyle}>
              26 direct reports, 40 concurrent projects, PMP culture transformation
            </h3>
            <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.6 }}>
              Drove a delivery-culture transformation from 0% PMP certification
              to near-universal adoption over 18 months across a multi-site
              engineering organization.
            </p>
          </a>

          <a
            href={`${Z_BASE}/kill-story.html`}
            target="_blank"
            rel="noreferrer"
            style={evidenceCardStyle}
            onClick={() =>
              trackEvent("leadership_evidence", "open_kill_story")
            }
          >
            <div style={evidenceLabelStyle}>Make Hard Portfolio Decisions</div>
            <h3 style={evidenceTitleStyle}>
              Killed a failing acquired program, redeployed resources
            </h3>
            <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.6 }}>
              Assessed a stalled acquired program, presented the case to senior
              executives, terminated it within seven days, and redeployed 100%
              of resources to higher-conviction work.
            </p>
          </a>

          <a
            href={`${Z_BASE}/india-story.html`}
            target="_blank"
            rel="noreferrer"
            style={evidenceCardStyle}
            onClick={() =>
              trackEvent("leadership_evidence", "open_india_story")
            }
          >
            <div style={evidenceLabelStyle}>Build Global Engineering Capacity</div>
            <h3 style={evidenceTitleStyle}>
              Selected partners, integrated 30+ engineers in India
            </h3>
            <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.6 }}>
              Evaluated five Indian engineering firms, selected two partners,
              integrated 30+ engineers, and built a distributed delivery
              operating model across the US and India.
            </p>
          </a>

          <a
            href={`${Z_BASE}/storeage-story.html`}
            target="_blank"
            rel="noreferrer"
            style={evidenceCardStyle}
            onClick={() =>
              trackEvent("leadership_evidence", "open_storeage_story")
            }
          >
            <div style={evidenceLabelStyle}>Lead Acquisition Integration</div>
            <h3 style={evidenceTitleStyle}>
              StoreAge integration across departments and product execution
            </h3>
            <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.6 }}>
              Appointed integration manager reporting to the CEO; aligned
              departments and later led joint product development across
              design, architecture, engineering, and test.
            </p>
          </a>

          <a
            href={`${Z_BASE}/ozo-story.html`}
            target="_blank"
            rel="noreferrer"
            style={evidenceCardStyle}
            onClick={() =>
              trackEvent("leadership_evidence", "open_ozo_story")
            }
          >
            <div style={evidenceLabelStyle}>Build Operating Systems for People</div>
            <h3 style={evidenceTitleStyle}>
              Ozo advisory: leadership structure, compensation, operating cadence
            </h3>
            <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.6 }}>
              Provided multi-year strategic advisory support, helping stabilize
              leadership structure, operating cadence, compensation design, and
              execution practices.
            </p>
          </a>
        </div>
      </section>

      {/* 3. HOW I LEAD ENGINEERING — operating model */}
      <section id="operating-model" style={sectionWrap()}>
        <div style={sectionEyebrowStyle}>02 — Operating Model</div>
        <h2 style={sectionHeadingStyle}>How I Lead Engineering</h2>
        <p style={sectionLeadStyle}>
          My leadership model is architecture-grounded and execution-oriented:
          clarify the system, align the organization, then drive accountable
          delivery.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={operatingCardStyle}>
            <div style={operatingLabelStyle}>Translate</div>
            <p style={operatingBodyStyle}>
              Translate ambiguity into executable programs.
            </p>
          </div>
          <div style={operatingCardStyle}>
            <div style={operatingLabelStyle}>Align</div>
            <p style={operatingBodyStyle}>
              Align engineering, product, research, business, and executives.
            </p>
          </div>
          <div style={operatingCardStyle}>
            <div style={operatingLabelStyle}>Cadence</div>
            <p style={operatingBodyStyle}>
              Build cadence across roadmaps, risks, dependencies, and
              decisions.
            </p>
          </div>
          <div style={operatingCardStyle}>
            <div style={operatingLabelStyle}>Scale</div>
            <p style={operatingBodyStyle}>
              Scale teams through structure, standards, delegation, and talent
              development.
            </p>
          </div>
          <div style={operatingCardStyle}>
            <div style={operatingLabelStyle}>Decide</div>
            <p style={operatingBodyStyle}>
              Make portfolio decisions: invest, pause, redirect, or kill.
            </p>
          </div>
          <div style={operatingCardStyle}>
            <div style={operatingLabelStyle}>Stay Current</div>
            <p style={operatingBodyStyle}>
              Stay technically current enough to challenge architecture and
              build when needed.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BUILDER LAYER / ACTIVE SYSTEMS */}
      <section id="builder-layer" style={sectionWrap()}>
        <div style={sectionEyebrowStyle}>03 — Builder Layer</div>
        <h2 style={sectionHeadingStyle}>Active Systems</h2>
        <p style={sectionLeadStyle}>
          These active systems show continuing technical depth. They are not a
          substitute for leadership evidence; they prove that my engineering
          judgment remains current at the implementation level.
        </p>

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
                  section: "builder_layer",
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
                  section: "builder_layer",
                },
              });
            }}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <h3>MHT Capability Deck</h3>
              <p style={{ margin: 0 }}>
                Asynchronous signal tracking, ANN filtering, and the
                architecture behind the system — explained end to end.
              </p>
            </div>
          </a>

          <CardLink to="/systems/qrlphoenix" title="QRLPhoenix">
            <p style={{ margin: 0 }}>
              AI-assisted iOS strategy discovery and evaluation platform
              connected to the research engine.
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

      {/* 5. EVIDENCE / EXPERIMENTAL SYSTEMS */}
      <section id="evidence" style={sectionWrap()}>
        <div style={sectionEyebrowStyle}>04 — Evidence / Experimental Systems</div>
        <h2 style={sectionHeadingStyle}>Architecture evidence — not production systems</h2>
        <p style={sectionLeadStyle}>
          These are synthetic-data demonstrations and architecture artifacts
          that show how the underlying decision structures behave. They are
          evidence of the architectural approach, not production systems.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          <a
            href="https://demomhtfaiss.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent("navigation", "open_mht_faiss_decision_architecture_demo");
              sendTelemetry({
                app: "industriallystrong",
                lane: "general",
                eventType: "outbound_click",
                metadata: {
                  label: "mht_faiss_decision_architecture_demo",
                  href: "https://demomhtfaiss.industriallystrong.com",
                  section: "evidence_experimental",
                  maturity: "synthetic_demo_architecture_evidence",
                },
              });
            }}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="structure-card">
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "rgba(251, 191, 36, 0.12)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251, 191, 36, 0.35)",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                Synthetic Demo — Architecture Evidence, Not Production System
              </div>
              <h3 style={{ marginTop: 0 }}>MHT/FAISS Decision Architecture Demo</h3>
              <p style={{ margin: 0 }}>
                Synthetic-data demonstration comparing LLM-only single-answer
                inference against hypothesis-preserving decision architecture
                using latent state encoding, similarity retrieval, and
                competing hypothesis tracking.
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* 6. LABS / TECHNICAL ARTIFACTS */}
      <section id="labs" style={sectionWrap()}>
        <div style={sectionEyebrowStyle}>05 — Labs &amp; Technical Artifacts</div>
        <h2 style={sectionHeadingStyle}>Where the engineering judgment shows up</h2>
        <p style={sectionLeadStyle}>
          Architecture write-ups, research notes, and decks behind the active
          systems above.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "22px",
          }}
        >
          <CardLink to="/architecture" title="Architecture">
            <p style={{ margin: 0 }}>
              System architecture and the reasoning behind structural choices.
            </p>
          </CardLink>

          <CardLink to="/research" title="Research">
            <p style={{ margin: 0 }}>
              Foundational work on signal processing, candidate state tracking,
              and associative retrieval.
            </p>
          </CardLink>

          <CardLink to="/decks" title="Decks">
            <p style={{ margin: 0 }}>
              Capability decks summarizing systems, programs, and outcomes.
            </p>
          </CardLink>

          <CardLink to="/lab" title="Lab">
            <p style={{ margin: 0 }}>
              Working notebooks, experiments, and engineering scratch surfaces.
            </p>
          </CardLink>

          <CardLink to="/correctness" title="Correctness Arbitration">
            <p style={{ margin: 0 }}>
              Where deterministic decision structures replace convincing-but-wrong AI reasoning.
            </p>
          </CardLink>

          <CardLink to="/programs" title="Programs">
            <p style={{ margin: 0 }}>
              Program-level rollups and portfolio context.
            </p>
          </CardLink>
        </div>
      </section>

      {/* 6. CONTACT / LINKEDIN */}
      <section id="contact" style={sectionWrap({ marginBottom: "48px" })}>
        <div style={sectionEyebrowStyle}>06 — Contact</div>
        <h2 style={sectionHeadingStyle}>Get in touch</h2>
        <p style={sectionLeadStyle}>
          For executive engineering leadership conversations, partnership
          discussions, or deeper review of the leadership evidence above.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <PrimaryButton to="/contact" eventLabel="contact_section_open_contact">
            Contact
          </PrimaryButton>

          <a
            href="https://www.linkedin.com/in/zahirudeen-premji-5a7a553b1/"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("external", "linkedin_profile_home")}
            style={{
              display: "inline-block",
              padding: "12px 22px",
              borderRadius: "8px",
              background: "transparent",
              color: "#f5f7fa",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textDecoration: "none",
              border: "1px solid #334155",
            }}
          >
            LinkedIn →
          </a>
        </div>
      </section>

      <LiveMetricsCard />
    </PageShell>
  );
}

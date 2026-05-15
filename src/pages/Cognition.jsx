import PageShell from "../components/PageShell";

/* ═══════════════════════════════════════════════════════════════════════
   PM47.10.1 — Cognition showcase page.
   Public, auth-free static evidence surface. Hosts the seven banked
   PM47.9.2 production frames with operator-curated captions tied to
   the cognition vocabulary.
   ─────────────────────────────────────────────────────────────────────
   Strategic frame (operator-locked 2026-05-15):
     This page is about cognition infrastructure. Finance is the
     demonstration substrate — visible test data — NOT the core
     thesis. The core thesis is:
       contradiction management, thesis integrity under evidence
       pressure, operational coherence, replayability, and governance
       of machine-assisted reasoning.
   ─────────────────────────────────────────────────────────────────────
   Maturity discipline preserved (Δ-14 / §11.4):
     - Substrate          : PROVEN  (35/35 substrate tests; production-verified)
     - Demonstrator       : IMPLEMENTED (seed-curated; DEMONSTRATOR-labelled)
     - Live runner-agent  : DESIGN GOAL
   ───────────────────────────────────────────────────────────────────── */


/* ─── Five terminology anchors (the page's vocabulary contract) ──────── */
const concepts = [
  {
    term: "Contradiction pressure",
    abbr: "C",
    body:
      "A first-class quantity, not a side effect. Every active hypothesis " +
      "is scored not only by evidence supporting it, but by the magnitude " +
      "of evidence working against it. The system surfaces both.",
  },
  {
    term: "Thesis integrity",
    abbr: "θ",
    body:
      "The load-bearing output is not buy / sell. It is whether the " +
      "structural integrity of a directional belief is strengthening, " +
      "degrading, or stable as evidence accumulates over time.",
  },
  {
    term: "Bounded runner search",
    abbr: "R",
    body:
      "Adversarial evidence acquisition attached to a specific hypothesis, " +
      "with explicit source allow-lists and exclusion-lists, capped result " +
      "count, and a final classification (supports / contradicts / mixed " +
      "/ inconclusive) that does NOT mutate the hypothesis's direction.",
  },
  {
    term: "Replay identity",
    abbr: "ρ",
    body:
      "Every cognition snapshot — at every layer (signal, driver, bias, " +
      "evidence packet) — is bound to a deterministic content-addressed " +
      "hash. The system is auditable, replayable, and provable at the " +
      "byte level. There is no opaque inference state.",
  },
  {
    term: "Demonstrator governance",
    abbr: "D",
    body:
      "Live autonomous inference is reserved for explicit later tranches. " +
      "Surfaces operating on seeded scenarios are labelled DEMONSTRATOR " +
      "in-band — visibly, immutably, on every frame. The discipline " +
      "between PROVEN, IMPLEMENTED, and DESIGN GOAL is part of the system, " +
      "not a footnote about it.",
  },
];


/* ─── Seven banked frames (PM47.9.2 proof-pack) ───────────────────────── */
const frames = [
  {
    file: "/cognition/2026-05-15_pm47_9_2_grid.png",
    title: "Five concurrent hypotheses",
    caption:
      "Five instruments, five concurrent directional hypotheses, each " +
      "scored on evidence pressure and contradiction pressure independently. " +
      "DEMONSTRATOR labelling is in-band, not metadata.",
    anchors: ["thesis integrity", "contradiction pressure", "demonstrator governance"],
  },
  {
    file: "/cognition/2026-05-15_pm47_9_2_es_detail.png",
    title: "Thesis integrity under contradiction pressure",
    caption:
      "The hypothesis is LONG. Evidence supporting it is moderate. " +
      "Contradiction is rising on convergent signals — breadth deterioration, " +
      "rate environment, sector rotation. The system does not flip the " +
      "direction; it surfaces the structural decay of the thesis honestly. " +
      "Four contradictory signals are counted in-frame.",
    anchors: ["thesis integrity", "contradiction pressure", "bounded runner search"],
    loadBearing: true,
  },
  {
    file: "/cognition/2026-05-15_pm47_9_2_nq_detail.png",
    title: "Distinct driver mixes per hypothesis",
    caption:
      "A separate instrument with a distinct contradiction profile. " +
      "Driver weights are operator-curated per surface; the system reasons " +
      "over different signal mixes for different hypotheses rather than " +
      "collapsing everything into a single global sentiment score.",
    anchors: ["contradiction pressure", "thesis integrity"],
  },
  {
    file: "/cognition/2026-05-15_pm47_9_2_operator_auth.png",
    title: "Operator-scoped access, not anonymous",
    caption:
      "The cognition surface is gated by intentional operator " +
      "authentication. Session-scoped — closing the tab ends the " +
      "session. No public account system, no persistent identity. " +
      "Demonstrator labelling is preserved in the auth-gate frame.",
    anchors: ["demonstrator governance"],
  },
  {
    file: "/cognition/2026-05-15_pm47_9_2_authenticated_header.png",
    title: "Auth as a first-class surface element",
    caption:
      "The operator session is part of the chrome. State is legible at " +
      "a glance: authenticated, clearable, never assumed. The discipline " +
      "is the same as the cognition logic — explicit, bounded, " +
      "non-magical.",
    anchors: ["demonstrator governance"],
  },
  {
    file: "/cognition/2026-05-15_pm47_9_2_replay_identity.png",
    title: "Every snapshot is hash-anchored",
    caption:
      "The replay-identity footer on every card binds the rendered state " +
      "to a deterministic content-addressed hash. Cognition is auditable " +
      "at the byte level. There is no opaque, irreproducible inference " +
      "state. This is what separates an operational substrate from a " +
      "black-box prediction model.",
    anchors: ["replay identity"],
  },
  {
    file: "/cognition/2026-05-15_pm47_9_2_runner_evidence.png",
    title: "Bounded adversarial evidence, surfaced honestly",
    caption:
      "Runner-supported signals on the left; contradictory signal count " +
      "in red. The bounded search returns both — and the final " +
      "classification is recorded as MIXED, not as a single directional " +
      "verdict. This is the conceptual differentiator: the system reasons " +
      "about the quality of its own thesis, not only about a market.",
    anchors: ["bounded runner search", "contradiction pressure"],
    loadBearing: true,
  },
];


/* ─── Maturity table (preserves §11.4 discipline in the public artifact) */
const maturityRows = [
  {
    layer: "Cognition substrate (signal → driver → bias → evidence packet → regime snapshot)",
    status: "PROVEN",
    note: "Backend test suite green; production-verified 2026-05-15.",
  },
  {
    layer: "Hash-chained replay identity at every cognition layer",
    status: "PROVEN",
    note: "Deterministic content-addressed; verified per snapshot.",
  },
  {
    layer: "Operator authentication + session bootstrap UX",
    status: "PROVEN",
    note: "Modal-driven, session-scoped, cross-tab logout.",
  },
  {
    layer: "Seeded demonstrator cognition scenarios (five hypotheses)",
    status: "IMPLEMENTED",
    note:
      "DEMONSTRATOR-labelled in-band. Scenarios are operator-curated, " +
      "not produced by a live agent network.",
  },
  {
    layer: "Live autonomous runner-agent evidence acquisition",
    status: "DESIGN GOAL",
    note:
      "Substrate exists and is hash-anchored; live agent feeding ships " +
      "with the next live-inference tranche.",
  },
  {
    layer: "Cross-driver regime coherence layer",
    status: "DESIGN GOAL",
    note:
      "The next conceptual transition. Architecture is reserved.",
  },
];


/* ─── Style tokens (matched to Architecture.jsx / CorrectnessArbitration.jsx) */
const S = {
  label: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    opacity: 0.72,
    marginBottom: "12px",
  },
  hero: {
    fontSize: "44px",
    lineHeight: 1.05,
    marginBottom: "12px",
    letterSpacing: "-0.01em",
  },
  heroSubtitle: {
    fontSize: "20px",
    maxWidth: "820px",
    opacity: 0.86,
    lineHeight: 1.5,
    marginBottom: "10px",
  },
  demonstratorChip: {
    display: "inline-block",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    borderRadius: "4px",
    color: "#fcd34d",
    border: "1px solid rgba(234,179,8,0.45)",
    background: "rgba(234,179,8,0.10)",
    textTransform: "uppercase",
  },
  sectionH2: {
    fontSize: "28px",
    lineHeight: 1.2,
    marginBottom: "14px",
    maxWidth: "920px",
  },
  sectionLede: {
    fontSize: "17px",
    lineHeight: 1.6,
    opacity: 0.88,
    maxWidth: "820px",
    marginBottom: "24px",
  },
  conceptCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderLeft: "4px solid rgba(252,211,77,0.55)",
    borderRadius: "14px",
    padding: "20px 22px",
    background: "rgba(255,255,255,0.025)",
    marginBottom: "16px",
  },
  conceptHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginBottom: "8px",
  },
  conceptTerm: {
    fontSize: "20px",
    fontWeight: 700,
  },
  conceptAbbr: {
    fontSize: "12px",
    fontFamily: "monospace",
    opacity: 0.55,
  },
  conceptBody: {
    fontSize: "15px",
    lineHeight: 1.6,
    opacity: 0.86,
  },
  frameCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.02)",
    padding: "20px",
    marginBottom: "26px",
  },
  frameCardLoadBearing: {
    border: "1px solid rgba(252,211,77,0.35)",
    borderRadius: "14px",
    background: "rgba(252,211,77,0.04)",
    padding: "20px",
    marginBottom: "26px",
  },
  frameImage: {
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.25)",
    display: "block",
  },
  frameTitle: {
    fontSize: "20px",
    fontWeight: 700,
    marginTop: "16px",
    marginBottom: "8px",
    lineHeight: 1.3,
  },
  frameCaption: {
    fontSize: "15px",
    lineHeight: 1.6,
    opacity: 0.88,
    marginBottom: "10px",
  },
  frameAnchorRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  frameAnchorChip: {
    fontSize: "11px",
    padding: "3px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    opacity: 0.78,
    textTransform: "lowercase",
    letterSpacing: "0.02em",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.02)",
    marginBottom: "40px",
  },
  th: {
    padding: "14px 18px",
    textAlign: "left",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontWeight: 600,
    color: "rgba(255,255,255,0.55)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 18px",
    fontSize: "15px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    lineHeight: 1.5,
    verticalAlign: "top",
  },
  proven: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    background: "rgba(16,185,129,0.15)",
    color: "#6ee7b7",
    border: "1px solid rgba(16,185,129,0.30)",
    whiteSpace: "nowrap",
  },
  implemented: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    background: "rgba(56,189,248,0.15)",
    color: "#7dd3fc",
    border: "1px solid rgba(56,189,248,0.30)",
    whiteSpace: "nowrap",
  },
  designGoal: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    background: "rgba(234,179,8,0.12)",
    color: "#fcd34d",
    border: "1px solid rgba(234,179,8,0.25)",
    whiteSpace: "nowrap",
  },
  pullquote: {
    fontSize: "22px",
    lineHeight: 1.45,
    fontWeight: 500,
    maxWidth: "880px",
    padding: "20px 0 20px 24px",
    borderLeft: "3px solid rgba(252,211,77,0.55)",
    margin: "32px 0",
    fontStyle: "italic",
    opacity: 0.95,
  },
};


function StatusBadge({ status }) {
  const style =
    status === "PROVEN" ? S.proven :
    status === "IMPLEMENTED" ? S.implemented :
    S.designGoal;
  return <span style={style}>{status}</span>;
}


export default function Cognition() {
  return (
    <PageShell>

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          <h1 style={S.hero}>Directional Cognition</h1>
          <span style={S.demonstratorChip}>Demonstrator</span>
        </div>
        <p style={S.heroSubtitle}>
          A cognition infrastructure surface that continuously tests
          directional market beliefs against evolving public evidence.
          Each hypothesis is scored on evidence pressure, contradiction
          pressure, and runner-agent verification. The system reasons
          about the structural integrity of its own thesis — not just
          about a price direction.
        </p>
        <p style={{ ...S.heroSubtitle, fontSize: "16px", opacity: 0.7 }}>
          Live production surface:{" "}
          <a
            href="https://phoenix.industriallystrong.com/cognition"
            style={{ color: "#7dd3fc", textDecoration: "none" }}
          >
            phoenix.industriallystrong.com/cognition
          </a>{" "}
          (operator authentication required). The seven frames below are
          banked production captures from 2026-05-15.
        </p>
      </section>

      {/* ─── THE CATEGORY GAP ─────────────────────────────────────────── */}
      <section style={{ marginBottom: "56px" }}>
        <div style={S.label}>The visible category gap</div>
        <h2 style={S.sectionH2}>
          Finance is the demonstration substrate. Cognition is the system.
        </h2>
        <p style={S.sectionLede}>
          Most public AI-in-finance work reads as a dashboard — predictive
          arrows on a chart, sentiment scores, opaque recommendations. The
          operational threshold beyond that category is harder to see and
          harder to fake. Four properties separate it:
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          <li
            style={{
              padding: "16px 18px",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              fontSize: "15px",
              lineHeight: 1.55,
            }}
          >
            <strong>Authenticated runtime.</strong> The cognition surface is
            gated by intentional operator authentication. No anonymous
            sessions, no auto-mounted state, no implicit identity.
          </li>
          <li
            style={{
              padding: "16px 18px",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              fontSize: "15px",
              lineHeight: 1.55,
            }}
          >
            <strong>Hash-anchored replay identity.</strong> Every snapshot at
            every layer is bound to a deterministic content-addressed hash.
            The system is reproducible at the byte level.
          </li>
          <li
            style={{
              padding: "16px 18px",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              fontSize: "15px",
              lineHeight: 1.55,
            }}
          >
            <strong>Bounded adversarial evidence.</strong> Runner search is
            constrained, source-controlled, and returns supports AND
            contradicts. Conclusions never silently mutate the hypothesis
            they were dispatched to test.
          </li>
          <li
            style={{
              padding: "16px 18px",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              fontSize: "15px",
              lineHeight: 1.55,
            }}
          >
            <strong>In-band maturity discipline.</strong> Seeded scenarios
            are labelled DEMONSTRATOR on every frame. The distinction
            between proven substrate and design-goal layers is part of the
            system, not a disclaimer attached to it.
          </li>
        </ul>

        <p style={S.pullquote}>
          The highest-value signal is not buy / sell. It is whether your
          belief is strengthening or degrading under accumulating evidence.
        </p>
      </section>

      {/* ─── FIVE TERMINOLOGY ANCHORS ─────────────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div style={S.label}>Five vocabulary anchors</div>
        <h2 style={S.sectionH2}>The conceptual primitives.</h2>
        <p style={S.sectionLede}>
          These five terms recur across the operational surface, the
          backend substrate, and the engineering tests. They are the
          system's interface to the world — and the language under
          which the rest of this page is legible.
        </p>

        {concepts.map((c) => (
          <div key={c.term} style={S.conceptCard}>
            <div style={S.conceptHeader}>
              <div style={S.conceptTerm}>{c.term}</div>
              <div style={S.conceptAbbr}>({c.abbr})</div>
            </div>
            <div style={S.conceptBody}>{c.body}</div>
          </div>
        ))}
      </section>

      {/* ─── OPERATIONAL EVIDENCE: 7 FRAMES ───────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div style={S.label}>Operational evidence — 2026-05-15 production captures</div>
        <h2 style={S.sectionH2}>
          Seven frames from a live cognition surface.
        </h2>
        <p style={S.sectionLede}>
          These are not mockups. Every frame is a production screenshot
          banked from the operator-authenticated{" "}
          <code style={{ fontFamily: "monospace", fontSize: "15px", opacity: 0.85 }}>
            phoenix.industriallystrong.com/cognition
          </code>{" "}
          surface on 2026-05-15. The DEMONSTRATOR labelling is visible
          in-band on every frame; the seeded-vs-live distinction is part
          of the artifact, not omitted from it.
        </p>

        {frames.map((f, i) => (
          <div
            key={f.file}
            style={f.loadBearing ? S.frameCardLoadBearing : S.frameCard}
          >
            <img src={f.file} alt={f.title} style={S.frameImage} loading="lazy" />
            <div style={S.frameTitle}>
              {i + 1}. {f.title}
              {f.loadBearing && (
                <span
                  style={{
                    ...S.demonstratorChip,
                    marginLeft: "12px",
                    fontSize: "10px",
                    color: "#fcd34d",
                    background: "rgba(234,179,8,0.08)",
                    border: "1px solid rgba(234,179,8,0.35)",
                    verticalAlign: "middle",
                  }}
                >
                  Load-bearing
                </span>
              )}
            </div>
            <div style={S.frameCaption}>{f.caption}</div>
            <div style={S.frameAnchorRow}>
              {f.anchors.map((a) => (
                <span key={a} style={S.frameAnchorChip}>{a}</span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ─── MATURITY DISCIPLINE ──────────────────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div style={S.label}>What is proven, what is implemented, what is design goal</div>
        <h2 style={S.sectionH2}>
          The discipline is part of the architecture.
        </h2>
        <p style={S.sectionLede}>
          Distinguishing what has been validated against adversarial
          challenge from what is operational-but-untested from what
          remains design goal is what separates an institutional system
          from a pitch. The table below is the canonical maturity statement
          for the surfaces shown on this page.
        </p>

        <div style={S.tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={S.th}>Layer</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {maturityRows.map((row, i) => (
                <tr key={i}>
                  <td style={S.td}>{row.layer}</td>
                  <td style={S.td}><StatusBadge status={row.status} /></td>
                  <td style={{ ...S.td, opacity: 0.85 }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={S.sectionLede}>
          What this surface is NOT: live autonomous inference. The
          displayed runner evidence is operator-curated demonstrator
          data, not the output of a live agent network. The DEMONSTRATOR
          chip and footnote are the in-band guard against that elision.
        </p>
      </section>

      {/* ─── PM48 DOORWAY ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div style={S.label}>The next conceptual transition</div>
        <h2 style={S.sectionH2}>Beyond per-instrument cognition.</h2>
        <p style={S.sectionLede}>
          The system shown on this page reasons about the structural
          integrity of each directional hypothesis independently. That is
          a real category transition past predictive dashboards — but it
          is not the final one.
        </p>
        <p style={S.pullquote}>
          The next category transition is no longer per-instrument
          cognition under contradiction pressure, but coherence tracking
          across interacting market drivers operating under conflicting
          structural regimes.
        </p>
        <p style={S.sectionLede}>
          Architecture for that layer is reserved. The surface above is
          the substrate it ships against.
        </p>
      </section>

      {/* ─── METHODS / REFERENCES ─────────────────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div style={S.label}>Methods + references</div>
        <h2 style={{ ...S.sectionH2, fontSize: "22px" }}>How to read this page.</h2>
        <ul
          style={{
            fontSize: "15px",
            lineHeight: 1.7,
            opacity: 0.86,
            paddingLeft: "20px",
            maxWidth: "860px",
          }}
        >
          <li>
            <strong>Production surface:</strong>{" "}
            <a
              href="https://phoenix.industriallystrong.com/cognition"
              style={{ color: "#7dd3fc", textDecoration: "none" }}
            >
              phoenix.industriallystrong.com/cognition
            </a>{" "}
            (operator authentication required).
          </li>
          <li>
            <strong>Capture date:</strong> 2026-05-15. Seven banked frames
            with per-frame verification checklists.
          </li>
          <li>
            <strong>Maturity language:</strong> PROVEN means adversarial
            challenge-lab validated. IMPLEMENTED means operational but not
            yet promoted through the challenge gate. DESIGN GOAL means
            architectural — not yet validated. These three are not used
            interchangeably anywhere on this page or in the underlying
            system.
          </li>
          <li>
            <strong>Demonstrator labelling:</strong> the gold DEMONSTRATOR
            chip is present in every production frame. Removing it requires
            promoting the live-autonomous-runner layer from DESIGN GOAL to
            IMPLEMENTED, which has not happened.
          </li>
          <li>
            <strong>Companion narrative:</strong> a long-form essay framing
            the work is in preparation. When published, it will link from
            here.
          </li>
        </ul>
      </section>

      {/* ─── FOOTER NOTE ──────────────────────────────────────────────── */}
      <section style={{ opacity: 0.55, fontSize: "13px", lineHeight: 1.6 }}>
        Cognition surface is part of the IndustriallyStrong systems
        portfolio. The architecture is independent of the demonstration
        substrate; the same primitives apply to non-financial reasoning
        domains under the same governance discipline.
      </section>

    </PageShell>
  );
}

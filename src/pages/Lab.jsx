import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import PageShell from "../components/PageShell";

/* ═══════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — matched to finance.industriallystrong.com
   Light background, monospace headers, red/blue comparison system
   ═══════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#ffffff",
  surface:   "#f8f9fa",
  surfaceAlt:"#f1f3f5",
  border:    "#dee2e6",
  borderHi:  "#adb5bd",
  text:      "#212529",
  textDim:   "#495057",
  textFaint: "#868e96",
  blue:      "#2563eb",
  blueDim:   "#dbeafe",
  red:       "#dc2626",
  redDim:    "#fee2e2",
  green:     "#16a34a",
  greenDim:  "#dcfce7",
  amber:     "#d97706",
  amberDim:  "#fef3c7",
  purple:    "#7c3aed",
  purpleDim: "#ede9fe",
  cyan:      "#0891b2",
  mono:      "'SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
  sans:      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  radius:    "6px",
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES — matching finance site patterns
   ═══════════════════════════════════════════════════════════════════════ */

function SectionNumber({ n }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.mono,
      color: T.textFaint, marginRight: 12, fontWeight: 400,
    }}>{String(n).padStart(2, "0")}</span>
  );
}

function SectionTitle({ n, children }) {
  return (
    <h2 style={{
      fontFamily: T.mono, fontSize: 14, fontWeight: 600,
      letterSpacing: "0.12em", textTransform: "uppercase",
      color: T.text, margin: "0 0 16px", display: "flex", alignItems: "center",
    }}>
      <SectionNumber n={n} />
      {children}
    </h2>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "48px 0" }} />;
}

function MetricCard({ label, value, color = T.blue, borderColor }) {
  return (
    <div style={{
      flex: 1, minWidth: 140, padding: "16px 20px",
      border: `1px solid ${T.border}`, borderRadius: T.radius,
      borderTop: `3px solid ${borderColor || color}`, background: T.bg,
    }}>
      <div style={{
        fontFamily: T.mono, fontSize: 10, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: T.textFaint, marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: T.mono, fontSize: 24, fontWeight: 700, color,
      }}>{value}</div>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div style={{
      border: `1px solid ${T.border}`, borderRadius: T.radius,
      background: T.surface, padding: "20px 24px", marginBottom: 20,
    }}>
      {title && (
        <div style={{
          fontFamily: T.mono, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: T.textFaint, marginBottom: 16,
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

function CompareCard({ title, items, color, borderColor }) {
  return (
    <div style={{
      flex: 1, minWidth: 260, padding: "20px 24px",
      border: `1px solid ${T.border}`, borderRadius: T.radius,
      borderTop: `3px solid ${borderColor || color}`, background: T.bg,
    }}>
      <div style={{
        fontFamily: T.mono, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color, marginBottom: 12,
      }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          fontSize: 14, color: T.textDim, lineHeight: 1.7,
        }}>
          <span style={{ color, fontSize: 8, marginTop: 7 }}>●</span>
          {item}
        </div>
      ))}
    </div>
  );
}

function EvidenceBox({ mechanism, controlledVar, measuredOutput, significance }) {
  return (
    <div style={{
      margin: "20px 0 0", padding: "16px 20px", borderRadius: T.radius,
      border: `1px solid ${T.blueDim}`, background: "#f0f4ff",
      fontSize: 13, lineHeight: 1.7, color: T.textDim,
    }}>
      <div style={{
        fontFamily: T.mono, fontWeight: 700, color: T.blue, fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
      }}>Evidence Layer</div>
      <div><strong style={{ color: T.text }}>Mechanism:</strong> {mechanism}</div>
      <div><strong style={{ color: T.text }}>Controlled Variable:</strong> {controlledVar}</div>
      <div><strong style={{ color: T.text }}>Measured Output:</strong> {measuredOutput}</div>
      <div><strong style={{ color: T.text }}>Why It Matters:</strong> {significance}</div>
    </div>
  );
}

function ClaimTag({ children }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 3,
      background: T.surfaceAlt, border: `1px solid ${T.border}`,
      fontFamily: T.mono, fontSize: 9, fontWeight: 600,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: T.textFaint, marginLeft: 12, verticalAlign: "middle",
    }}>{children}</span>
  );
}

function Callout({ children, color = T.red }) {
  return (
    <div style={{
      padding: "14px 20px", borderRadius: T.radius,
      background: T.surface, borderLeft: `3px solid ${color}`,
      fontFamily: T.mono, fontSize: 13, color: T.textDim, lineHeight: 1.6,
    }}>{children}</div>
  );
}

const EVIDENCE_POSTURES = {
  simulated: { label: "Simulated", color: T.blue, bg: T.blueDim, desc: "Generated by bounded stochastic model" },
  abstracted: { label: "Abstracted", color: T.purple, bg: T.purpleDim, desc: "Structural behavior isolated from implementation" },
  derived: { label: "Derived", color: T.green, bg: T.greenDim, desc: "Calculated from controlled variables" },
  "architecture-level": { label: "Architecture", color: T.amber, bg: T.amberDim, desc: "Structural claim about system design" },
};

function EvidenceTag({ type, inline }) {
  const p = EVIDENCE_POSTURES[type];
  if (!p) return null;
  return (
    <span title={p.desc} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: inline ? "1px 7px" : "2px 9px", borderRadius: 3,
      background: p.bg, border: `1px solid ${p.color}20`,
      fontFamily: T.mono, fontSize: inline ? 9 : 10, fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: p.color, verticalAlign: "middle",
      marginLeft: inline ? 8 : 0, cursor: "default",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, opacity: 0.7 }} />
      {p.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATION ENGINE — pre-seeds data on mount so charts are never empty
   ═══════════════════════════════════════════════════════════════════════ */

function seedCoreSimulation(ticks = 40) {
  const states = [];
  for (let i = 0; i < 6; i++) {
    states.push({
      id: i, vector: [Math.random()*0.4+0.3, Math.random()*0.4+0.3, Math.random()*0.3+0.2],
      confidence: Math.random()*0.3+0.5, age: 0, status: "active", label: `H${i}`,
    });
  }

  const history = [];
  let totalCreated = 6, totalRetired = 0, totalMerges = 0;
  const mergeLog = [];
  let currentStates = [...states];

  for (let t = 0; t < ticks; t++) {
    currentStates = currentStates.map(s => {
      if (s.status !== "active") return s;
      const newVec = s.vector.map(v => Math.max(0.05, Math.min(0.95, v + (Math.random()-0.48)*0.06)));
      const spread = Math.max(...newVec) - Math.min(...newVec);
      const newConf = Math.max(0.05, Math.min(0.99, s.confidence + (Math.random()-0.5)*0.08 - spread*0.05));
      return { ...s, vector: newVec, confidence: newConf, age: s.age + 1 };
    });

    currentStates = currentStates.map(s => {
      if (s.status === "active" && s.confidence < 0.15 && s.age > 5) { totalRetired++; return { ...s, status: "retired" }; }
      return s;
    });

    const active = currentStates.filter(s => s.status === "active");
    if (active.length >= 3) {
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const dist = Math.sqrt(active[i].vector.reduce((sum, v, k) => sum + (v - active[j].vector[k])**2, 0));
          if (dist < 0.12 && Math.random() > 0.6) {
            const loser = active[i].confidence < active[j].confidence ? active[i] : active[j];
            const winner = loser === active[i] ? active[j] : active[i];
            currentStates = currentStates.map(s => {
              if (s.id === loser.id) return { ...s, status: "merged" };
              if (s.id === winner.id) return { ...s, confidence: Math.min(0.99, s.confidence + 0.05) };
              return s;
            });
            totalMerges++;
            mergeLog.push({ tick: t, from: loser.label, to: winner.label });
            break;
          }
        }
      }
    }

    const activeCount = currentStates.filter(s => s.status === "active").length;
    if (activeCount < 3 && Math.random() > 0.4) {
      const newId = totalCreated++;
      currentStates.push({
        id: newId, vector: [Math.random()*0.4+0.3, Math.random()*0.4+0.3, Math.random()*0.3+0.2],
        confidence: Math.random()*0.2+0.4, age: 0, status: "active", label: `H${newId}`,
      });
    }

    history.push({ tick: t, active: currentStates.filter(s => s.status === "active").length, total: totalCreated });
  }

  return { states: currentStates, history, mergeLog, totalCreated, totalRetired, totalMerges };
}

function seedBaselineData(ticks = 70) {
  const data = [];
  let single = 0.5, parallel = [0.5, 0.5, 0.5, 0.5];
  for (let t = 0; t < ticks; t++) {
    const regimeShift = (t > 20 && t < 25) || (t > 45 && t < 50);
    const shiftMag = regimeShift ? 0.15 : 0;
    single = Math.max(0.01, Math.min(0.99, single + (Math.random()-0.48)*0.04 - shiftMag));
    parallel = parallel.map(v => Math.max(0.01, Math.min(0.99, v + (Math.random()-0.48)*0.05 + (regimeShift ? (Math.random()-0.5)*0.2 : 0))));
    data.push({ t, single: +single.toFixed(3), parallel: +Math.max(...parallel).toFixed(3), regime: regimeShift ? 1 : 0 });
  }
  return data;
}

function seedFinanceData(ticks = 80) {
  const data = [];
  let baseline = 100, multi = 100, persistent = 100;
  for (let t = 0; t < ticks; t++) {
    const regimeShift = (t > 15 && t < 22) || (t > 40 && t < 47);
    baseline = Math.max(20, baseline + (Math.random()-0.49)*2 + (regimeShift ? -3 : 0.2));
    multi = Math.max(20, multi + (Math.random()-0.48)*1.8 + (regimeShift ? -1.5 : 0.15));
    persistent = Math.max(20, persistent + (Math.random()-0.47)*1.5 + (regimeShift ? -0.8 : 0.25));
    data.push({ t, baseline: +baseline.toFixed(1), multi: +multi.toFixed(1), persistent: +persistent.toFixed(1), regime: regimeShift ? 1 : 0 });
  }
  return data;
}

function seedProcessData(ticks = 70) {
  const data = [];
  let rigid = 0.5, adaptive = 0.5;
  for (let t = 0; t < ticks; t++) {
    const perturbation = (t > 18 && t < 24) || (t > 42 && t < 48);
    rigid = Math.max(0, Math.min(1, rigid + (Math.random()-0.5)*0.03 + (perturbation ? -0.08 : 0.005)));
    adaptive = Math.max(0, Math.min(1, adaptive + (Math.random()-0.48)*0.025 + (perturbation ? -0.02 : 0.008)));
    data.push({ t, rigid: +rigid.toFixed(3), adaptive: +adaptive.toFixed(3), perturbation: perturbation ? 1 : 0 });
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LAB COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function Lab() {
  const [showEvidence, setShowEvidence] = useState(false);

  // Pre-seed all data on mount so charts are never empty
  const [coreSim] = useState(() => seedCoreSimulation(40));
  const [baselineData] = useState(() => seedBaselineData(70));
  const [financeData] = useState(() => seedFinanceData(80));
  const [processData] = useState(() => seedProcessData(70));

  const activeStates = coreSim.states.filter(s => s.status === "active");
  const compressionRatio = (coreSim.totalCreated / Math.max(1, activeStates.length)).toFixed(2);
  const meanSurvival = activeStates.length > 0
    ? (activeStates.reduce((s, st) => s + st.age, 0) / activeStates.length).toFixed(1) : "0.0";

  // Finance metrics
  const fLast = financeData[financeData.length - 1] || {};
  const fBaseDD = Math.max(...financeData.map(d => d.baseline)) - fLast.baseline;
  const fPersistDD = Math.max(...financeData.map(d => d.persistent)) - fLast.persistent;

  // Process metrics
  const pLast = processData[processData.length - 1] || {};

  return (
    <PageShell>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 32px 96px",
        color: T.text,
        fontFamily: T.sans,
      }}>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION: LabHero
            Compressed: headline, one-liner, quick-jump anchors.
            ═══════════════════════════════════════════════════════════════ */}
        <section id="lab-hero">
          <div style={{
            fontFamily: T.mono, fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: T.textFaint, marginBottom: 16,
          }}>
            Lab
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.2,
            fontWeight: 700, margin: "0 0 8px", color: T.text,
          }}>
            Systems that commit early collapse.
          </h1>
          <h1 style={{
            fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.2,
            fontWeight: 700, margin: "0 0 16px", color: T.blue,
          }}>
            Systems that preserve alternatives adapt.
          </h1>

          <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.6, maxWidth: 700, margin: "0 0 24px" }}>
            Controlled experiments in persistence, divergence, and adaptive control — examined across process, signal, and decision domains.
          </p>

          {/* Quick-jump anchors — visible on first screen */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 0 }}>
            {[
              { label: "Domains", target: "browse-by-domain" },
              { label: "All Labs", target: "all-labs" },
              { label: "About", target: "about-labs" },
            ].map(btn => (
              <button
                key={btn.target}
                onClick={() => document.getElementById(btn.target)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={{
                  padding: "6px 16px", border: `1px solid ${T.border}`,
                  borderRadius: T.radius, background: T.bg, color: T.text,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  fontFamily: T.mono,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION: FeaturedLabs
            Primary entry path — 4 strongest labs as clickable cards.
            ═══════════════════════════════════════════════════════════════ */}
        <section id="featured-labs">
          <SectionTitle n={1}>Featured</SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { href: "/lab/alab.html", title: "Architecture Lab", desc: "How distributed control inserts into existing fab tools without modifying them.", color: T.blue, posture: "architecture-level" },
              { href: "/lab/phoenix-state.html", title: "Closed-Loop State Tracking", desc: "Competing hypotheses scored and updated in real time — live control loop.", color: T.green, posture: "simulated" },
              { href: "/lab/multihead.html", title: "Distributed Writer Array", desc: "12,000 parallel emitters with per-site dose calibration.", color: T.purple, posture: "derived" },
              { href: "#core-system", title: "State Evolution Simulator", desc: "Watch candidate states spawn, merge, retire, and survive regime shifts.", color: T.amber, internal: true, posture: "simulated" },
            ].map(card => (
              <a
                key={card.href}
                href={card.href}
                {...(!card.internal ? { target: "_blank", rel: "noreferrer" } : {})}
                onClick={card.internal ? (e) => { e.preventDefault(); document.getElementById("core-system")?.scrollIntoView({ behavior: "smooth", block: "start" }); } : undefined}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{
                  padding: "18px 20px", border: `1px solid ${T.border}`, borderRadius: T.radius,
                  borderTop: `3px solid ${card.color}`, background: T.bg,
                  transition: "border-color 0.15s ease", height: "100%",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.borderTopColor = card.color; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 14, color: T.text, fontWeight: 600 }}>{card.title}</h4>
                    {card.posture && <EvidenceTag type={card.posture} inline />}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: T.textFaint, lineHeight: 1.5 }}>{card.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
        {/* End FeaturedLabs */}

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════
            SECTION: BrowseByDomain
            Domain-organized content: Core System, Financial, Process.
            Each domain's full content preserved within its subsection.
            ═══════════════════════════════════════════════════════════════ */}
        <section id="browse-by-domain">
          <SectionTitle n={2}>Browse by Domain</SectionTitle>

          {/* Domain index — three clickable pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { label: "Core System", target: "core-system", color: T.blue },
              { label: "Financial", target: "domain-modules", color: T.amber },
              { label: "Process", target: "domain-process", color: T.green },
              { label: "Evidence", target: "evidence-summary", color: T.purple },
            ].map(d => (
              <button
                key={d.target}
                onClick={() => document.getElementById(d.target)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={{
                  padding: "5px 14px", border: `1.5px solid ${d.color}`,
                  borderRadius: 20, background: T.bg, color: d.color,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: T.mono, letterSpacing: "0.04em",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Patent alignment — moved down from hero */}
          <div style={{
            margin: "0 0 16px", padding: "12px 16px", borderRadius: T.radius,
            border: `1px solid ${T.border}`, background: T.surface,
          }}>
            <div style={{
              fontFamily: T.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.textFaint, marginBottom: 8,
            }}>Patent Alignment</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Core System Architecture", ref: "Patent #3" },
                { label: "Signal Interpretation", ref: "Patent #1" },
                { label: "Process Stability", ref: "Patent #2" },
              ].map((p, i) => (
                <div key={i} style={{
                  padding: "6px 12px", borderRadius: T.radius, background: T.bg,
                  border: `1px solid ${T.border}`, fontSize: 12,
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.blue, fontWeight: 600, marginRight: 6 }}>{p.ref}</span>
                  <span style={{ color: T.textDim }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence toggle — moved down from hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: T.textDim, userSelect: "none" }}>
              <div onClick={() => setShowEvidence(!showEvidence)} style={{
                width: 38, height: 20, borderRadius: 10, position: "relative",
                background: showEvidence ? T.blue : T.border, cursor: "pointer", transition: "background 0.2s ease",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 2, left: showEvidence ? 20 : 2,
                  transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
              Show Evidence Layer
            </label>
            {showEvidence && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.blue }}>Evidence annotations visible</span>}
          </div>

          {/* Evidence posture legend */}
          <div style={{
            display: "flex", gap: 16, flexWrap: "wrap", margin: "12px 0 0",
            padding: "10px 16px", borderRadius: T.radius,
            background: T.surface, border: `1px solid ${T.border}`,
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: "22px" }}>Evidence Posture:</span>
            {Object.entries(EVIDENCE_POSTURES).map(([key, p]) => (
              <span key={key} title={p.desc} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T.textDim }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: p.color }}>{p.label}</span>
                <span style={{ fontSize: 10, color: T.textFaint }}>— {p.desc.toLowerCase()}</span>
              </span>
            ))}
          </div>

          <Divider />

          {/* ── Domain 1: Core System ────────────────────────────────── */}
          <section id="core-system">
          {/* Domain header bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
            padding: "8px 0", borderBottom: `2px solid ${T.blue}`,
          }}>
            <span style={{
              fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: T.blue,
            }}>Domain</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Core System</span>
          </div>
          <SectionTitle n={3}>Parallel State Evolution<ClaimTag>Patent #3 — Architecture</ClaimTag></SectionTitle>
          <div style={{ marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EvidenceTag type="simulated" />
            <EvidenceTag type="architecture-level" />
          </div>

          <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, maxWidth: 700, margin: "0 0 28px" }}>
            Candidate states evolve in parallel. States are created, evaluated,
            merged when similar, and retired when confidence drops. No single state
            is committed to prematurely.
          </p>

          {/* Two-column compare cards — scannable at a glance */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <CompareCard title="Early Commitment" color={T.red} items={[
              "One state selected at ingestion",
              "Commits before uncertainty resolves",
              "Vulnerable to regime change",
              "No mechanism to detect disagreement",
            ]} />
            <CompareCard title="Parallel Persistence" color={T.blue} items={[
              "Preserves competing candidate states",
              "Measures divergence explicitly",
              "Tolerates ambiguity through transitions",
              "Resolves after evidence accumulates",
            ]} />
          </div>

          {/* State Formalization Table — data first, definition after */}
          <ChartBox title="State Formalization — Abstracted Representation ◆ SIMULATED">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: T.mono }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    {["ID", "Vector", "Confidence", "Age", "Status"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, color: T.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coreSim.states.filter(s => s.status === "active").slice(0, 8).map(s => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "8px 12px", color: T.blue, fontWeight: 600 }}>{s.label}</td>
                      <td style={{ padding: "8px 12px", color: T.textDim }}>[{s.vector.map(v => v.toFixed(2)).join(", ")}]</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: s.confidence > 0.6 ? T.green : s.confidence > 0.3 ? T.amber : T.red }}>
                        {(s.confidence * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: "8px 12px", color: T.textDim }}>{s.age}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, color: T.green, background: T.greenDim }}>{s.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showEvidence && (
              <EvidenceBox mechanism="Parallel state persistence" controlledVar="Number of concurrent candidate states"
                measuredOutput="Individual state survival duration and confidence trajectory"
                significance="Maintaining multiple states prevents premature commitment to a single interpretation" />
            )}
          </ChartBox>

          {/* Metrics row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <MetricCard label="Active States" value={activeStates.length} color={T.blue} />
            <MetricCard label="Total Created" value={coreSim.totalCreated} color={T.text} borderColor={T.border} />
            <MetricCard label="Total Retired" value={coreSim.totalRetired} color={T.red} />
            <MetricCard label="Mean Survival" value={`${meanSurvival} ticks`} color={T.text} borderColor={T.border} />
          </div>

          {/* Active States Chart */}
          <ChartBox title="Active States Over Time ◆ SIMULATED">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={coreSim.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="tick" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} />
                  <YAxis tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} domain={[0, "auto"]} />
                  <Tooltip contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 12, fontFamily: T.mono }} />
                  <Area type="monotone" dataKey="active" stroke={T.blue} fill={T.blueDim} strokeWidth={2} name="Active States" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {showEvidence && (
              <EvidenceBox mechanism="State population dynamics" controlledVar="Retirement threshold and spawn rate"
                measuredOutput="Active count stability, mean survival duration"
                significance="Stable population indicates balanced exploration-exploitation" />
            )}
          </ChartBox>

          {/* Compression Panel */}
          <ChartBox title="Compression Behavior — Similarity-Based Merge ◆ SIMULATED">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <MetricCard label="Raw States" value={coreSim.totalCreated} color={T.text} borderColor={T.border} />
              <MetricCard label="Retained" value={activeStates.length} color={T.blue} />
              <MetricCard label="Merge Events" value={coreSim.totalMerges} color={T.purple} borderColor={T.purple} />
              <MetricCard label="Compression Ratio" value={`${compressionRatio}×`} color={T.blue} />
            </div>
            <div style={{
              padding: "10px 16px", borderRadius: T.radius, background: T.surfaceAlt,
              fontFamily: T.mono, fontSize: 12, color: T.textDim,
            }}>
              Compression Ratio = raw_states / retained_states = {coreSim.totalCreated} / {activeStates.length} = <strong style={{ color: T.blue }}>{compressionRatio}</strong>
            </div>
            <div style={{
              marginTop: 12, padding: "10px 16px", borderRadius: T.radius,
              background: T.bg, border: `1px solid ${T.border}`,
              fontFamily: T.mono, fontSize: 12, color: T.textDim, lineHeight: 1.7,
            }}>
              <span style={{ fontWeight: 700, color: T.textFaint, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Merge Criterion: </span>
              States merge when <strong style={{ color: T.text }}>d(S<sub>i</sub>, S<sub>j</sub>) {"<"} ε</strong> and both <strong style={{ color: T.text }}>w<sub>i</sub>, w<sub>j</sub> {">"} w<sub>min</sub></strong>.
              <span style={{ display: "block", marginTop: 4, fontSize: 11, color: T.textFaint, fontStyle: "italic" }}>
                Distance threshold ε and confidence floor w<sub>min</sub> prevent premature or low-quality merges.
              </span>
            </div>
            {coreSim.mergeLog.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: T.textFaint, fontFamily: T.mono }}>
                {coreSim.mergeLog.slice(-5).map((m, i) => (
                  <div key={i} style={{ padding: "3px 0" }}>t={m.tick}: {m.from} → merged into {m.to}</div>
                ))}
              </div>
            )}
            {showEvidence && (
              <EvidenceBox mechanism="Similarity-based state compression" controlledVar="Distance threshold for merge eligibility"
                measuredOutput="Compression ratio, merge frequency"
                significance="Compression without information loss maintains representational efficiency" />
            )}
          </ChartBox>

          {/* Formal State Definition — pushed below data for reduced top density */}
          <div style={{
            margin: "0 0 20px", padding: "14px 20px", borderRadius: T.radius,
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            fontFamily: T.mono, fontSize: 13, color: T.textDim, lineHeight: 1.8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textFaint, marginBottom: 8 }}>Formal Definition</div>
            <div>S<sub>i</sub> = ( <strong style={{ color: T.text }}>v</strong><sub>i</sub> , <strong style={{ color: T.text }}>w</strong><sub>i</sub> , <strong style={{ color: T.text }}>τ</strong><sub>i</sub> )</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              <span style={{ color: T.text }}>v<sub>i</sub></span> = state vector &nbsp;|&nbsp; <span style={{ color: T.text }}>w<sub>i</sub></span> = confidence weight &nbsp;|&nbsp; <span style={{ color: T.text }}>τ<sub>i</sub></span> = persistence duration
            </div>
            <div style={{ fontSize: 11, marginTop: 6, color: T.textFaint, fontStyle: "italic" }}>
              Each candidate state carries its own trajectory. Resolution occurs when evidence accumulates — not before.
            </div>
          </div>

          {/* Failure Mode */}
          <div style={{
            margin: "24px 0 28px", padding: "14px 20px", borderRadius: T.radius,
            borderLeft: `3px solid ${T.red}`, background: T.redDim,
            fontFamily: T.mono, fontSize: 13, color: T.textDim, lineHeight: 1.7,
          }}>
            <span style={{ fontWeight: 700, color: T.red, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Failure Mode: </span>
            Premature hypothesis collapse. When a system commits to a single state before sufficient evidence accumulates,
            it loses the ability to recover from misclassification. This is the core failure the architecture is designed to prevent.
          </div>

          {/* Baseline Comparison */}
          <SectionTitle n={3}>Baseline Comparison — Early Commitment vs Parallel Persistence<ClaimTag>Patent #1 — Signal</ClaimTag></SectionTitle>
          <div style={{ marginBottom: 12 }}><EvidenceTag type="simulated" /></div>

          <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, maxWidth: 700, margin: "0 0 20px" }}>
            Early commitment collapses on regime shift. Parallel persistence adapts through maintained alternatives.
          </p>

          <Callout color={T.amber}>Shaded regions = regime shift events</Callout>

          <ChartBox title="Capital Path — Early Commitment (Red) vs Parallel Persistence (Blue)">
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={baselineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} />
                  <YAxis tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} domain={[0, 1]} />
                  <Tooltip contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 12, fontFamily: T.mono }} />
                  <Line type="monotone" dataKey="single" stroke={T.red} strokeWidth={2} dot={false} name="Early Commitment" />
                  <Line type="monotone" dataKey="parallel" stroke={T.blue} strokeWidth={2} dot={false} name="Parallel Persistence" />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.mono }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {showEvidence && (
              <EvidenceBox mechanism="State persistence under regime change" controlledVar="Regime shift timing and magnitude"
                measuredOutput="Survival duration, recovery latency, divergence retention"
                significance="Parallel persistence avoids premature collapse and reduces adaptation latency" />
            )}
          </ChartBox>

          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <CompareCard title="Early Commitment" color={T.red} items={[
              "Commits to one interpretation",
              "Collapses on regime shift",
              "Recovery requires full re-estimation",
            ]} />
            <CompareCard title="Parallel Persistence" color={T.blue} items={[
              "Maintains competing candidate states",
              "Best survivor adapts through shift",
              "Latency reduced",
            ]} />
          </div>

          </section>
          {/* End Domain 1: Core System */}

          <Divider />

          {/* ── Domain 2: Financial — Dynamic Decision System ─────────── */}
          <section id="domain-modules">
            {/* Domain header bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
              padding: "8px 0", borderBottom: `2px solid ${T.amber}`,
            }}>
              <span style={{
                fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: T.amber,
              }}>Domain</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Financial</span>
            </div>
            <SectionTitle n={4}>Dynamic Decision System Under Regime Change<ClaimTag>Patent #1 — Application</ClaimTag></SectionTitle>
            <div style={{ marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <EvidenceTag type="simulated" />
              <EvidenceTag type="abstracted" />
            </div>

            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, maxWidth: 700, margin: "0 0 12px" }}>
              Portfolio-level comparison of strategy persistence under simulated market regime transitions.
              Three approaches applied to the same environment with identical perturbations.
            </p>

            <p style={{
              fontFamily: T.mono, fontSize: 13, color: T.textFaint, fontStyle: "italic",
              margin: "0 0 24px",
            }}>
              Simulated environment. No claims of real trading performance.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, fontSize: 14 }}>
              <div><strong style={{ color: T.textFaint, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Controlled Variable:</strong><br /><span style={{ color: T.text }}>Regime shift timing</span></div>
              <div><strong style={{ color: T.textFaint, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Observed Behavior:</strong><br /><span style={{ color: T.text }}>Strategy survival and recovery</span></div>
            </div>

            {/* Finance metrics */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <MetricCard label="Baseline Final" value={fLast.baseline} color={T.red} />
              <MetricCard label="Baseline Drawdown" value={`-${fBaseDD.toFixed(1)}`} color={T.red} />
              <MetricCard label="Persistent Final" value={fLast.persistent} color={T.blue} />
              <MetricCard label="Persistent Drawdown" value={`-${fPersistDD.toFixed(1)}`} color={T.blue} />
            </div>

            <ChartBox title="Capital Path — Baseline (Red) vs Multi-Strategy (Amber) vs Persistent System (Blue)">
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} />
                    <YAxis tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} />
                    <Tooltip contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 12, fontFamily: T.mono }} />
                    <Line type="monotone" dataKey="baseline" stroke={T.red} strokeWidth={1.5} dot={false} name="Baseline Strategy" />
                    <Line type="monotone" dataKey="multi" stroke={T.amber} strokeWidth={1.5} dot={false} name="Multi-Strategy (no persistence)" />
                    <Line type="monotone" dataKey="persistent" stroke={T.blue} strokeWidth={2} dot={false} name="Persistent System" />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.mono }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {showEvidence && (
                <EvidenceBox mechanism="Strategy persistence under regime change" controlledVar="Regime shift timing, transition magnitude"
                  measuredOutput="Drawdown depth, recovery time, strategy survival count, switching latency"
                  significance="Pre-positioned alternatives reduce loss magnitude and recovery duration" />
              )}
            </ChartBox>

            {/* Three-column compare */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <CompareCard title="Baseline" color={T.red} items={["Single strategy", "No regime detection", "Full drawdown exposure"]} />
              <CompareCard title="Multi (no persist)" color={T.amber} items={["Multiple strategies", "Reactive switching", "Latency on shift"]} />
              <CompareCard title="Persistent System" color={T.blue} items={["Parallel candidate states", "Pre-positioned", "Reduced recovery time"]} />
            </div>

          </section>
          {/* End Domain 2: Financial */}

            <Divider />

          {/* ── Domain 3: Process Stability ───────────────────────────── */}
          <section id="domain-process">
            {/* Domain header bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
              padding: "8px 0", borderBottom: `2px solid ${T.green}`,
            }}>
              <span style={{
                fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: T.green,
              }}>Domain</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Process</span>
            </div>
            <SectionTitle n={5}>Process Stability Under Perturbation<ClaimTag>Patent #2 — Process</ClaimTag></SectionTitle>
            <div style={{ marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <EvidenceTag type="abstracted" />
              <EvidenceTag type="simulated" />
            </div>

            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, maxWidth: 700, margin: "0 0 12px" }}>
              Comparison of rigid vs. adaptive process control under parameter perturbation events.
              Process state evolution modeled as an abstracted stability metric.
            </p>

            <p style={{
              fontFamily: T.mono, fontSize: 13, color: T.textFaint, fontStyle: "italic", margin: "0 0 24px",
            }}>
              Abstracted process model. No specific synthesis or deposition mechanics exposed.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, fontSize: 14 }}>
              <div><strong style={{ color: T.textFaint, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Controlled Variable:</strong><br /><span style={{ color: T.text }}>Perturbation magnitude</span></div>
              <div><strong style={{ color: T.textFaint, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Observed Behavior:</strong><br /><span style={{ color: T.text }}>Stability vs. collapse trajectory</span></div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <MetricCard label="Rigid Stability" value={`${(pLast.rigid * 100).toFixed(0)}%`} color={T.red} />
              <MetricCard label="Adaptive Stability" value={`${(pLast.adaptive * 100).toFixed(0)}%`} color={T.blue} />
            </div>

            <Callout color={T.amber}>Shaded regions = parameter perturbation events</Callout>

            <ChartBox title="Process State — Rigid (Red) vs Adaptive (Blue)">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} label={{ value: "Process Time", position: "insideBottomRight", offset: -5, fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} />
                    <YAxis tick={{ fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} stroke={T.border} domain={[0, 1]} label={{ value: "Process State", angle: -90, position: "insideLeft", fill: T.textFaint, fontSize: 10, fontFamily: T.mono }} />
                    <Tooltip contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 12, fontFamily: T.mono }} />
                    <Line type="monotone" dataKey="rigid" stroke={T.red} strokeWidth={1.5} dot={false} name="Rigid Process" />
                    <Line type="monotone" dataKey="adaptive" stroke={T.blue} strokeWidth={2} dot={false} name="Adaptive Process" />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.mono }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {showEvidence && (
                <EvidenceBox mechanism="Process state persistence under perturbation" controlledVar="Perturbation magnitude and duration"
                  measuredOutput="Stability metric, collapse threshold, recovery trajectory"
                  significance="Adaptive processes maintain operational continuity where rigid processes require recalibration" />
              )}
            </ChartBox>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <CompareCard title="Rigid Process" color={T.red} items={["Fixed parameter set", "Collapse on perturbation", "Requires full recalibration"]} />
              <CompareCard title="Adaptive Process" color={T.blue} items={["Maintains response alternatives", "Stability through perturbation", "Recovery without reset"]} />
            </div>
          </section>
          {/* End Domain 3: Process Stability */}

          <Divider />

          {/* ── Cross-Domain Evidence Summary (within BrowseByDomain) ─── */}
          <section id="evidence-summary">
            <SectionTitle n={6}>Cross-Domain Evidence Summary</SectionTitle>
            <div style={{ marginBottom: 12 }}><EvidenceTag type="derived" /></div>

            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, maxWidth: 700, margin: "0 0 24px" }}>
              Identical structural pattern examined across domains. Each module follows the same
              experimental framework: controlled variable, observed behavior, measured outputs, baseline comparison.
            </p>

            <div style={{
              margin: "0 0 20px", padding: "12px 20px", borderRadius: T.radius,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              fontFamily: T.mono, fontSize: 12, color: T.textDim, lineHeight: 1.6,
            }}>
              <strong style={{ color: T.text }}>Methodological constraint:</strong>{" "}
              Every claim in this table maps to a controlled variable, a measured output, and a baseline comparison. No entry is
              assertion-only. Each domain module produces its own falsifiable evidence under the same structural framework.
            </div>

            <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: T.radius }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.surfaceAlt }}>
                    {["Domain", "Mechanism", "Controlled Variable", "Measured Output", "Significance"].map(h => (
                      <th key={h} style={{ padding: "12px", textAlign: "left", fontFamily: T.mono, fontSize: 10, color: T.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `2px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { domain: "Core System", mechanism: "Parallel state persistence", cv: "Hypothesis count", output: "Survival duration, confidence", sig: "Prevents premature commitment", posture: "simulated" },
                    { domain: "Core System", mechanism: "Similarity-based compression", cv: "Distance threshold", output: "Compression ratio, merge frequency", sig: "Efficiency without information loss", posture: "simulated" },
                    { domain: "Financial", mechanism: "Strategy persistence under regime change", cv: "Regime shift timing", output: "Drawdown, recovery time, switching latency", sig: "Pre-positioned alternatives reduce loss", posture: "simulated" },
                    { domain: "Process", mechanism: "State persistence under perturbation", cv: "Perturbation magnitude", output: "Stability metric, collapse threshold", sig: "Operational continuity without recalibration", posture: "abstracted" },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "10px 12px", color: T.blue, fontWeight: 600, fontSize: 13 }}>{r.domain} <EvidenceTag type={r.posture} inline /></td>
                      <td style={{ padding: "10px 12px", color: T.text }}>{r.mechanism}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim }}>{r.cv}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim }}>{r.output}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontStyle: "italic" }}>{r.sig}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </section>
        {/* End BrowseByDomain */}

          <Divider />

        {/* ═══════════════════════════════════════════════════════════════
            SECTION: AllLabs
            Complete grid of all lab artifacts and explorations.
            ═══════════════════════════════════════════════════════════════ */}
        <section id="all-labs">
          <SectionTitle n={7}>All Labs</SectionTitle>

          <p style={{ fontSize: 14, color: T.textFaint, marginBottom: 20, lineHeight: 1.6 }}>
            Browse every lab artifact — simulations, visualizations, and technical deep-dives.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {[
              { href: "/lab/alab.html", title: "Architecture Lab", desc: "How distributed control inserts into existing fab tools. Constraint-driven implementation path.", domain: "Architecture" },
              { href: "/lab/phoenix-state.html", title: "Closed-Loop State Tracking", desc: "Competing hypotheses scored and updated in real time.", domain: "Core System" },
              { href: "/lab/multihead.html", title: "Distributed Writer Array", desc: "12,000 parallel emitters with per-site dose calibration.", domain: "Hardware" },
              { href: "/lab/psf-synthesis.html", title: "PSF Synthesis", desc: "Coupled spatial-temporal point spread function optimization.", domain: "Optics" },
              { href: "/lab/cta-evaluation.html", title: "CTA Evaluation Engine", desc: "Portfolio evaluation using state resolution — preserved alternatives, not collapsed answers.", domain: "Decision" },
              { href: "/lab/replica-race.html", title: "Replica Race Resolution", desc: "How distributed replicas converge when event ordering is ambiguous.", domain: "Distributed" },
            ].map(card => (
              <a key={card.href} href={card.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  padding: "16px 20px", border: `1px solid ${T.border}`, borderRadius: T.radius,
                  borderTop: `3px solid ${T.blue}`, background: T.bg,
                  transition: "border-color 0.15s ease",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.blue}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >
                  <div style={{
                    fontFamily: T.mono, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: T.textFaint, marginBottom: 6,
                  }}>{card.domain}</div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, color: T.text, fontWeight: 600 }}>{card.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: T.textFaint, lineHeight: 1.5 }}>{card.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
        {/* End AllLabs */}

          <Divider />

        {/* ═══════════════════════════════════════════════════════════════
            SECTION: AboutLabs
            Methodology note and contextual footer for the lab page.
            ═══════════════════════════════════════════════════════════════ */}
        <section id="about-labs">
          <SectionTitle n={8}>About the Lab</SectionTitle>

          <div style={{
            padding: "16px 20px", borderRadius: T.radius,
            borderLeft: `3px solid ${T.border}`, background: T.surfaceAlt,
            fontFamily: T.mono, fontSize: 12, color: T.textFaint, lineHeight: 1.7,
          }}>
            <strong style={{ color: T.textDim }}>Methodology Note:</strong>{" "}
            All simulations on this page use abstracted models to demonstrate structural behavior.
            Stochastic elements are bounded and labeled. No claims of production-grade fidelity are made.
            This artifact presents controlled system experiments — not predictions. Every section is tagged with its
            evidence posture — simulated, abstracted, derived, or architecture-level — so you always know what kind of truth is being presented.
          </div>

          <div style={{
            marginTop: 20, padding: "16px 20px", borderRadius: T.radius,
            border: `1px solid ${T.border}`, background: T.bg,
            fontSize: 13, color: T.textDim, lineHeight: 1.7,
          }}>
            <strong style={{ color: T.text }}>What is the Lab?</strong>{" "}
            The Lab is a collection of technical artifacts exploring how controlled systems behave
            under uncertainty. Each experiment isolates a structural principle — persistence, divergence,
            adaptation — and examines it across multiple domains with consistent methodology.
            The same framework applies whether the domain is process control, signal interpretation,
            or decision architecture.
          </div>

          <p style={{
            fontFamily: T.mono, fontSize: 12, color: T.textFaint, lineHeight: 1.7,
            maxWidth: 700, margin: "20px 0 0", fontStyle: "italic",
          }}>
            This lab presents a series of controlled system experiments designed to explore how
            complex systems behave under uncertainty. The same structural principles are examined
            across multiple technical contexts.
          </p>
        </section>
        {/* End AboutLabs */}
      </div>
    </PageShell>
  );
}

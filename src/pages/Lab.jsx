import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — shared across all layers and modules
   ═══════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#0a0f1a",
  surface:   "#0f172a",
  border:    "#1e293b",
  borderHi:  "#334155",
  text:      "#e2e8f0",
  textDim:   "#94a3b8",
  textFaint: "#64748b",
  accent:    "#3b82f6",
  accentDim: "#1d4ed8",
  green:     "#22c55e",
  greenDim:  "#166534",
  amber:     "#f59e0b",
  amberDim:  "#92400e",
  red:       "#ef4444",
  redDim:    "#991b1b",
  purple:    "#a78bfa",
  cyan:      "#06b6d4",
  mono:      "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
  sans:      "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  radius:    "10px",
};

const chartColors = {
  primary:   T.accent,
  secondary: T.green,
  tertiary:  T.amber,
  danger:    T.red,
  muted:     T.textFaint,
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════ */
function Panel({ title, tag, children, style }) {
  return (
    <div style={{
      border: `1px solid ${T.border}`, borderRadius: T.radius,
      background: T.surface, padding: "24px", ...style,
    }}>
      {(title || tag) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {tag && <Tag label={tag} />}
          {title && <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text }}>{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}

function Tag({ label, color = T.accent, bg = T.accentDim + "33" }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", padding: "3px 9px", borderRadius: 12,
      color, background: bg,
    }}>
      {label}
    </span>
  );
}

function Metric({ label, value, unit, status, mono = true }) {
  const statusColor = status === "active" ? T.green : status === "warning" ? T.amber : status === "danger" ? T.red : T.textDim;
  return (
    <div style={{ textAlign: "center", minWidth: 80 }}>
      <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono ? T.mono : T.sans, color: statusColor }}>
        {value}{unit && <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.6, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ margin: "56px 0 32px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textFaint, fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function EvidenceBox({ mechanism, controlledVar, measuredOutput, significance }) {
  return (
    <div style={{
      margin: "16px 0 0", padding: "14px 18px", borderRadius: 8,
      border: `1px solid ${T.accentDim}44`, background: T.accentDim + "11",
      fontSize: 13, lineHeight: 1.7, color: T.textDim,
    }}>
      <div style={{ fontWeight: 600, color: T.accent, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        Evidence Layer
      </div>
      <div><strong style={{ color: T.text }}>Mechanism:</strong> {mechanism}</div>
      <div><strong style={{ color: T.text }}>Controlled Variable:</strong> {controlledVar}</div>
      <div><strong style={{ color: T.text }}>Measured Output:</strong> {measuredOutput}</div>
      <div><strong style={{ color: T.text }}>Why It Matters:</strong> {significance}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATION ENGINE
   ═══════════════════════════════════════════════════════════════════════ */
function createInitialState() {
  const states = [];
  for (let i = 0; i < 6; i++) {
    states.push({
      id: i,
      vector: [Math.random() * 0.4 + 0.3, Math.random() * 0.4 + 0.3, Math.random() * 0.3 + 0.2],
      confidence: Math.random() * 0.3 + 0.5,
      age: 0,
      status: "active",
      label: `H${i}`,
    });
  }
  return states;
}

function useSimulation() {
  const [states, setStates] = useState(createInitialState);
  const [history, setHistory] = useState([]);
  const [mergeLog, setMergeLog] = useState([]);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("parallel"); // "parallel" | "single"
  const totalCreated = useRef(6);
  const totalRetired = useRef(0);
  const totalMerges = useRef(0);
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setStates(prev => {
      let next = prev.map(s => {
        if (s.status !== "active") return s;
        // Evolve state vector with bounded random walk
        const newVec = s.vector.map(v => {
          const drift = (Math.random() - 0.48) * 0.06;
          return Math.max(0.05, Math.min(0.95, v + drift));
        });
        // Update confidence based on internal consistency
        const spread = Math.max(...newVec) - Math.min(...newVec);
        const confDelta = (Math.random() - 0.5) * 0.08 - spread * 0.05;
        const newConf = Math.max(0.05, Math.min(0.99, s.confidence + confDelta));
        return { ...s, vector: newVec, confidence: newConf, age: s.age + 1 };
      });

      // Retire low-confidence states
      next = next.map(s => {
        if (s.status === "active" && s.confidence < 0.15 && s.age > 5) {
          totalRetired.current++;
          return { ...s, status: "retired" };
        }
        return s;
      });

      // Merge similar states (similarity-based compression)
      const active = next.filter(s => s.status === "active");
      if (active.length >= 3) {
        for (let i = 0; i < active.length; i++) {
          for (let j = i + 1; j < active.length; j++) {
            const dist = Math.sqrt(
              active[i].vector.reduce((sum, v, k) => sum + (v - active[j].vector[k]) ** 2, 0)
            );
            if (dist < 0.12 && Math.random() > 0.6) {
              const loser = active[i].confidence < active[j].confidence ? active[i] : active[j];
              const winner = loser === active[i] ? active[j] : active[i];
              next = next.map(s => {
                if (s.id === loser.id) return { ...s, status: "merged" };
                if (s.id === winner.id) return { ...s, confidence: Math.min(0.99, s.confidence + 0.05) };
                return s;
              });
              totalMerges.current++;
              setMergeLog(ml => [...ml.slice(-19), { tick: tick + 1, from: loser.label, to: winner.label }]);
              break;
            }
          }
        }
      }

      // Spawn new state if active count drops
      const activeCount = next.filter(s => s.status === "active").length;
      if (activeCount < 3 && Math.random() > 0.4) {
        const newId = totalCreated.current++;
        next = [...next, {
          id: newId,
          vector: [Math.random() * 0.4 + 0.3, Math.random() * 0.4 + 0.3, Math.random() * 0.3 + 0.2],
          confidence: Math.random() * 0.2 + 0.4,
          age: 0,
          status: "active",
          label: `H${newId}`,
        }];
      }

      return next;
    });

    setTick(t => t + 1);
    setHistory(h => {
      const newEntry = { tick: h.length };
      return [...h.slice(-59), newEntry];
    });
  }, [tick]);

  // Recalculate history entries with live state data
  useEffect(() => {
    const activeCount = states.filter(s => s.status === "active").length;
    setHistory(h => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      return [...h.slice(0, -1), { ...last, active: activeCount, total: totalCreated.current }];
    });
  }, [states]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(step, 1800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, step]);

  const activeStates = states.filter(s => s.status === "active");
  const retiredStates = states.filter(s => s.status === "retired" || s.status === "merged");
  const compressionRatio = totalCreated.current > 0 ? (totalCreated.current / Math.max(1, activeStates.length)).toFixed(2) : "1.00";
  const meanSurvival = activeStates.length > 0
    ? (activeStates.reduce((s, st) => s + st.age, 0) / activeStates.length).toFixed(1)
    : "0.0";

  return {
    states, activeStates, retiredStates, history, mergeLog, tick,
    running, setRunning, mode, setMode, step,
    totalCreated: totalCreated.current,
    totalRetired: totalRetired.current,
    totalMerges: totalMerges.current,
    compressionRatio, meanSurvival,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   BASELINE COMPARISON SIMULATION
   ═══════════════════════════════════════════════════════════════════════ */
function useBaselineComparison() {
  const [data, setData] = useState([]);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(0);
  const singleRef = useRef(0.5);
  const parallelRef = useRef([0.5, 0.5, 0.5, 0.5]);
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    tickRef.current++;
    const t = tickRef.current;

    // Regime shift at t=20 and t=45
    const regimeShift = (t > 20 && t < 25) || (t > 45 && t < 50);
    const shiftMag = regimeShift ? 0.15 : 0;

    // Single-path: collapses on shift
    const sDrift = (Math.random() - 0.48) * 0.04 - shiftMag;
    singleRef.current = Math.max(0.01, Math.min(0.99, singleRef.current + sDrift));

    // Parallel: some states survive shift
    parallelRef.current = parallelRef.current.map(v => {
      const pDrift = (Math.random() - 0.48) * 0.05 + (regimeShift ? (Math.random() - 0.5) * 0.2 : 0);
      return Math.max(0.01, Math.min(0.99, v + pDrift));
    });
    const bestParallel = Math.max(...parallelRef.current);

    setData(prev => [...prev.slice(-69), {
      t,
      single: parseFloat(singleRef.current.toFixed(3)),
      parallel: parseFloat(bestParallel.toFixed(3)),
      regime: regimeShift ? 1 : 0,
    }]);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(step, 400);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, step]);

  const reset = useCallback(() => {
    tickRef.current = 0;
    singleRef.current = 0.5;
    parallelRef.current = [0.5, 0.5, 0.5, 0.5];
    setData([]);
  }, []);

  return { data, running, setRunning, reset };
}

/* ═══════════════════════════════════════════════════════════════════════
   FINANCIAL DOMAIN SIMULATION
   ═══════════════════════════════════════════════════════════════════════ */
function useFinanceSim() {
  const [data, setData] = useState([]);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(0);
  const baselineRef = useRef(100);
  const multiRef = useRef(100);
  const persistentRef = useRef(100);
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    tickRef.current++;
    const t = tickRef.current;
    const regimeShift = (t > 15 && t < 22) || (t > 40 && t < 47);

    // Baseline: single strategy, no adaptation
    const bDrift = (Math.random() - 0.49) * 2 + (regimeShift ? -3 : 0.2);
    baselineRef.current = Math.max(20, baselineRef.current + bDrift);

    // Multi-strategy: no persistence (switches too fast)
    const mDrift = (Math.random() - 0.48) * 1.8 + (regimeShift ? -1.5 : 0.15);
    multiRef.current = Math.max(20, multiRef.current + mDrift);

    // Persistent: maintains multiple hypotheses, recovers
    const pDrift = (Math.random() - 0.47) * 1.5 + (regimeShift ? -0.8 : 0.25);
    persistentRef.current = Math.max(20, persistentRef.current + pDrift);

    setData(prev => [...prev.slice(-79), {
      t,
      baseline: parseFloat(baselineRef.current.toFixed(1)),
      multi: parseFloat(multiRef.current.toFixed(1)),
      persistent: parseFloat(persistentRef.current.toFixed(1)),
      regime: regimeShift ? 1 : 0,
    }]);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(step, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, step]);

  const reset = useCallback(() => {
    tickRef.current = 0;
    baselineRef.current = 100;
    multiRef.current = 100;
    persistentRef.current = 100;
    setData([]);
  }, []);

  return { data, running, setRunning, reset };
}

/* ═══════════════════════════════════════════════════════════════════════
   PROCESS DOMAIN SIMULATION
   ═══════════════════════════════════════════════════════════════════════ */
function useProcessSim() {
  const [data, setData] = useState([]);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(0);
  const rigidRef = useRef(0.5);
  const adaptiveRef = useRef(0.5);
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    tickRef.current++;
    const t = tickRef.current;
    const perturbation = (t > 18 && t < 24) || (t > 42 && t < 48);

    // Rigid process: collapses on perturbation
    const rDrift = (Math.random() - 0.5) * 0.03 + (perturbation ? -0.08 : 0.005);
    rigidRef.current = Math.max(0, Math.min(1, rigidRef.current + rDrift));

    // Adaptive process: maintains stability
    const aDrift = (Math.random() - 0.48) * 0.025 + (perturbation ? -0.02 : 0.008);
    adaptiveRef.current = Math.max(0, Math.min(1, adaptiveRef.current + aDrift));

    setData(prev => [...prev.slice(-79), {
      t,
      rigid: parseFloat(rigidRef.current.toFixed(3)),
      adaptive: parseFloat(adaptiveRef.current.toFixed(3)),
      perturbation: perturbation ? 1 : 0,
    }]);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(step, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, step]);

  const reset = useCallback(() => {
    tickRef.current = 0;
    rigidRef.current = 0.5;
    adaptiveRef.current = 0.5;
    setData([]);
  }, []);

  return { data, running, setRunning, reset };
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 1 — SYSTEM OVERVIEW
   ═══════════════════════════════════════════════════════════════════════ */
function SystemOverview({ onNavigate }) {
  return (
    <section style={{ marginBottom: 64, paddingBottom: 48, borderBottom: `1px solid ${T.border}` }}>
      <div style={{
        fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
        color: T.textFaint, marginBottom: 20,
      }}>
        Artifact Series: Controlled Systems Under Uncertainty
      </div>

      <h1 style={{
        fontSize: "clamp(24px, 4vw, 38px)", lineHeight: 1.25, letterSpacing: "-0.4px",
        marginBottom: 16, color: T.text, fontWeight: 700, maxWidth: 800,
      }}>
        Systems that commit early collapse.<br />
        Systems that preserve alternatives adapt.
      </h1>

      <p style={{
        fontSize: 17, color: T.textDim, lineHeight: 1.65, maxWidth: 720, margin: "0 0 12px",
      }}>
        A technical artifact demonstrating persistence, divergence, and controlled adaptation across domains.
      </p>

      <p style={{
        fontSize: 15, color: T.textFaint, lineHeight: 1.7, maxWidth: 700, margin: "0 0 32px",
      }}>
        This lab presents a series of controlled system experiments designed to explore how
        complex systems behave under uncertainty. The same structural principles are examined
        across multiple technical contexts.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Core System", target: "core-system" },
          { label: "Domain Modules", target: "domain-modules" },
          { label: "Evidence", target: "evidence-summary" },
        ].map(btn => (
          <button
            key={btn.target}
            onClick={() => {
              const el = document.getElementById(btn.target);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              padding: "10px 22px", border: `1px solid ${T.borderHi}`,
              borderRadius: 8, background: T.surface, color: T.text,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.target.style.borderColor = T.accent; e.target.style.color = T.accent; }}
            onMouseLeave={e => { e.target.style.borderColor = T.borderHi; e.target.style.color = T.text; }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 2 — CORE SYSTEM
   ═══════════════════════════════════════════════════════════════════════ */

/* ── A. State Formalization Panel ──────────────────────────────────── */
function StateFormalPanel({ states, showEvidence }) {
  const active = states.filter(s => s.status === "active");
  return (
    <Panel title="State Formalization" tag="ABSTRACTED">
      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 14 }}>
        Abstracted state representation — each hypothesis maintains an independent state vector.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: T.mono }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["ID", "Vector", "Confidence", "Age", "Status"].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, color: T.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.slice(-10).map(s => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}22`, opacity: s.status === "active" ? 1 : 0.4 }}>
                <td style={{ padding: "7px 10px", color: T.accent }}>{s.label}</td>
                <td style={{ padding: "7px 10px", color: T.textDim }}>
                  [{s.vector.map(v => v.toFixed(2)).join(", ")}]
                </td>
                <td style={{ padding: "7px 10px" }}>
                  <span style={{
                    color: s.confidence > 0.6 ? T.green : s.confidence > 0.3 ? T.amber : T.red,
                    fontWeight: 600,
                  }}>
                    {(s.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: "7px 10px", color: T.textDim }}>{s.age}</td>
                <td style={{ padding: "7px 10px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                    color: s.status === "active" ? T.green : s.status === "merged" ? T.purple : T.red,
                    background: (s.status === "active" ? T.greenDim : s.status === "merged" ? T.accentDim : T.redDim) + "33",
                  }}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showEvidence && (
        <EvidenceBox
          mechanism="Parallel state persistence"
          controlledVar="Number of concurrent hypotheses"
          measuredOutput="Individual state survival duration and confidence trajectory"
          significance="Maintaining multiple states prevents premature commitment to a single interpretation"
        />
      )}
    </Panel>
  );
}

/* ── B. Active Count + Survival Chart ──────────────────────────────── */
function ActiveCountPanel({ history, activeCount, totalCreated, totalRetired, meanSurvival, showEvidence }) {
  return (
    <Panel title="Active States Over Time" tag="TRACKING">
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 18 }}>
        <Metric label="Active" value={activeCount} status="active" />
        <Metric label="Total Created" value={totalCreated} />
        <Metric label="Total Retired" value={totalRetired} status={totalRetired > 10 ? "warning" : undefined} />
        <Metric label="Mean Survival" value={meanSurvival} unit="ticks" />
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="tick" tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} />
            <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: T.textFaint }}
            />
            <Area type="monotone" dataKey="active" stroke={T.green} fill={T.greenDim + "44"} strokeWidth={2} name="Active States" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {showEvidence && (
        <EvidenceBox
          mechanism="State population dynamics"
          controlledVar="Retirement threshold and spawn rate"
          measuredOutput="Active count stability, mean survival duration"
          significance="Stable population indicates balanced exploration-exploitation"
        />
      )}
    </Panel>
  );
}

/* ── C. Compression / Merge Panel ──────────────────────────────────── */
function CompressionPanel({ totalCreated, activeCount, totalMerges, compressionRatio, mergeLog, showEvidence }) {
  return (
    <Panel title="Compression Behavior" tag="SIMULATED">
      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 14 }}>
        Simulated similarity-based merge behavior
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
        <Metric label="Raw States" value={totalCreated} />
        <Metric label="Retained" value={activeCount} status="active" />
        <Metric label="Merge Events" value={totalMerges} />
        <Metric label="Compression" value={compressionRatio} unit="×" />
      </div>
      <div style={{
        padding: "10px 14px", borderRadius: 6,
        background: T.bg, border: `1px solid ${T.border}`,
        fontFamily: T.mono, fontSize: 12, color: T.textDim, marginBottom: 12,
      }}>
        Compression Ratio = raw_states / retained_states = {totalCreated} / {activeCount} = <span style={{ color: T.accent, fontWeight: 600 }}>{compressionRatio}</span>
      </div>
      {mergeLog.length > 0 && (
        <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 12, color: T.textFaint }}>
          {mergeLog.slice(-6).map((m, i) => (
            <div key={i} style={{ padding: "3px 0", borderBottom: `1px solid ${T.border}22` }}>
              <span style={{ color: T.purple }}>t={m.tick}</span>{" "}
              {m.from} → merged into {m.to}
            </div>
          ))}
        </div>
      )}
      {showEvidence && (
        <EvidenceBox
          mechanism="Similarity-based state compression"
          controlledVar="Distance threshold for merge eligibility"
          measuredOutput="Compression ratio, merge frequency"
          significance="Compression without information loss maintains representational efficiency"
        />
      )}
    </Panel>
  );
}

/* ── D. Baseline Comparison ────────────────────────────────────────── */
function BaselineComparison({ showEvidence }) {
  const sim = useBaselineComparison();

  return (
    <Panel title="Baseline Comparison" tag="CONTROLLED">
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => { sim.reset(); sim.setRunning(true); }}
          style={{
            padding: "8px 18px", border: `1px solid ${T.green}`, borderRadius: 6,
            background: T.greenDim + "33", color: T.green, fontSize: 12,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          ▶ Run Comparison
        </button>
        <button
          onClick={() => sim.setRunning(false)}
          style={{
            padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: 6,
            background: T.surface, color: T.textDim, fontSize: 12,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          ■ Pause
        </button>
      </div>

      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 6 }}>
        Single-path (collapses on regime shift) vs. Parallel persistence (adapts through maintained alternatives)
      </div>
      <div style={{ fontSize: 11, color: T.amber, marginBottom: 12 }}>
        Shaded regions = regime shift events
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sim.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} />
            <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} domain={[0, 1]} />
            <Tooltip
              contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="single" stroke={T.red} strokeWidth={2} dot={false} name="Single Path" />
            <Line type="monotone" dataKey="parallel" stroke={T.green} strokeWidth={2} dot={false} name="Parallel Persistence" />
            <Legend wrapperStyle={{ fontSize: 11, color: T.textDim }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", borderRadius: 8, background: T.redDim + "22", border: `1px solid ${T.redDim}44` }}>
          <div style={{ fontSize: 11, color: T.red, fontWeight: 600, marginBottom: 4 }}>SINGLE PATH</div>
          <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6 }}>
            Commits to one interpretation. Collapses on regime shift. Recovery requires full re-estimation.
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", borderRadius: 8, background: T.greenDim + "22", border: `1px solid ${T.greenDim}44` }}>
          <div style={{ fontSize: 11, color: T.green, fontWeight: 600, marginBottom: 4 }}>PARALLEL PERSISTENCE</div>
          <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6 }}>
            Maintains competing hypotheses. Best survivor adapts through shift. Latency reduced.
          </div>
        </div>
      </div>

      {showEvidence && (
        <EvidenceBox
          mechanism="State persistence under regime change"
          controlledVar="Regime shift timing and magnitude"
          measuredOutput="Survival duration, recovery latency, divergence retention"
          significance="Parallel persistence avoids premature collapse and reduces adaptation latency"
        />
      )}
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 3 — DOMAIN MODULES
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Module 1: Financial System ──────────────────────────────────── */
function FinanceModule({ showEvidence }) {
  const sim = useFinanceSim();
  const latest = sim.data[sim.data.length - 1] || {};
  const baseDD = sim.data.length > 0 ? Math.max(...sim.data.map(d => d.baseline)) - (latest.baseline || 100) : 0;
  const persistDD = sim.data.length > 0 ? Math.max(...sim.data.map(d => d.persistent)) - (latest.persistent || 100) : 0;

  return (
    <Panel style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Tag label="DOMAIN MODULE" color={T.cyan} bg={T.accentDim + "33"} />
        <Tag label="SIMULATED ENVIRONMENT" color={T.amber} bg={T.amberDim + "33"} />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, color: T.text }}>Dynamic Decision System Under Regime Change</h3>
      <p style={{ fontSize: 13, color: T.textFaint, margin: "0 0 18px", lineHeight: 1.6 }}>
        Portfolio-level comparison of strategy persistence under simulated market regime transitions.
        Three approaches applied to the same environment with identical perturbations.
      </p>

      {/* Module Structure */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18, fontSize: 13 }}>
        <div><strong style={{ color: T.textDim }}>Controlled Variable:</strong> <span style={{ color: T.text }}>Regime shift timing</span></div>
        <div><strong style={{ color: T.textDim }}>Observed Behavior:</strong> <span style={{ color: T.text }}>Strategy survival and recovery</span></div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => { sim.reset(); sim.setRunning(true); }} style={{ padding: "8px 18px", border: `1px solid ${T.cyan}`, borderRadius: 6, background: "transparent", color: T.cyan, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ▶ Run Simulation
        </button>
        <button onClick={() => sim.setRunning(false)} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface, color: T.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ■ Pause
        </button>
      </div>

      <div style={{ height: 220, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sim.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} label={{ value: "Time", position: "insideBottomRight", offset: -5, fill: T.textFaint, fontSize: 10 }} />
            <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} label={{ value: "Portfolio Value", angle: -90, position: "insideLeft", fill: T.textFaint, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12 }} />
            <Line type="monotone" dataKey="baseline" stroke={T.red} strokeWidth={1.5} dot={false} name="Baseline Strategy" />
            <Line type="monotone" dataKey="multi" stroke={T.amber} strokeWidth={1.5} dot={false} name="Multi-Strategy (no persistence)" />
            <Line type="monotone" dataKey="persistent" stroke={T.green} strokeWidth={2} dot={false} name="Persistent System" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Measured Outputs */}
      <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Measured Outputs</div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
        <Metric label="Baseline Drawdown" value={baseDD.toFixed(1)} status="danger" />
        <Metric label="Persistent Drawdown" value={persistDD.toFixed(1)} status="active" />
        <Metric label="Strategies Compared" value="3" mono={false} />
      </div>

      {/* Baseline Comparison Table */}
      <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Baseline Comparison</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { name: "Baseline", color: T.red, traits: ["Single strategy", "No regime detection", "Full drawdown exposure"] },
          { name: "Multi (no persist)", color: T.amber, traits: ["Multiple strategies", "Reactive switching", "Latency on shift"] },
          { name: "Persistent System", color: T.green, traits: ["Parallel hypotheses", "Pre-positioned", "Reduced recovery time"] },
        ].map(s => (
          <div key={s.name} style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.name}</div>
            {s.traits.map(t => (
              <div key={t} style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· {t}</div>
            ))}
          </div>
        ))}
      </div>

      {showEvidence && (
        <EvidenceBox
          mechanism="Strategy persistence under regime change"
          controlledVar="Regime shift timing, transition magnitude"
          measuredOutput="Drawdown depth, recovery time, strategy survival count, switching latency"
          significance="Pre-positioned alternatives reduce loss magnitude and recovery duration"
        />
      )}
    </Panel>
  );
}

/* ── Module 2: Process / Physical System ─────────────────────────── */
function ProcessModule({ showEvidence }) {
  const sim = useProcessSim();

  return (
    <Panel style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Tag label="DOMAIN MODULE" color={T.cyan} bg={T.accentDim + "33"} />
        <Tag label="ABSTRACTED" color={T.purple} bg={T.accentDim + "33"} />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, color: T.text }}>Process Stability Under Perturbation</h3>
      <p style={{ fontSize: 13, color: T.textFaint, margin: "0 0 18px", lineHeight: 1.6 }}>
        Comparison of rigid vs. adaptive process control under parameter perturbation events.
        Process state evolution modeled as an abstracted stability metric.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18, fontSize: 13 }}>
        <div><strong style={{ color: T.textDim }}>Controlled Variable:</strong> <span style={{ color: T.text }}>Parameter perturbation magnitude</span></div>
        <div><strong style={{ color: T.textDim }}>Observed Behavior:</strong> <span style={{ color: T.text }}>Stability vs. collapse trajectory</span></div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => { sim.reset(); sim.setRunning(true); }} style={{ padding: "8px 18px", border: `1px solid ${T.purple}`, borderRadius: 6, background: "transparent", color: T.purple, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ▶ Run Simulation
        </button>
        <button onClick={() => sim.setRunning(false)} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface, color: T.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ■ Pause
        </button>
      </div>

      <div style={{ fontSize: 11, color: T.amber, marginBottom: 8 }}>Shaded regions = parameter perturbation events</div>

      <div style={{ height: 200, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sim.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} label={{ value: "Process Time", position: "insideBottomRight", offset: -5, fill: T.textFaint, fontSize: 10 }} />
            <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.border} domain={[0, 1]} label={{ value: "Process State", angle: -90, position: "insideLeft", fill: T.textFaint, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12 }} />
            <Line type="monotone" dataKey="rigid" stroke={T.red} strokeWidth={1.5} dot={false} name="Rigid Process" />
            <Line type="monotone" dataKey="adaptive" stroke={T.green} strokeWidth={2} dot={false} name="Adaptive Process" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Measured Outputs</div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
        <Metric label="Rigid Stability" value={sim.data.length > 0 ? (sim.data[sim.data.length - 1].rigid * 100).toFixed(0) : "—"} unit="%" status={sim.data.length > 0 && sim.data[sim.data.length - 1].rigid < 0.3 ? "danger" : undefined} />
        <Metric label="Adaptive Stability" value={sim.data.length > 0 ? (sim.data[sim.data.length - 1].adaptive * 100).toFixed(0) : "—"} unit="%" status="active" />
        <Metric label="Recovery Behavior" value={sim.data.length > 10 ? "Tracked" : "—"} mono={false} />
      </div>

      {/* Baseline Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <div style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.red, marginBottom: 6 }}>Rigid Process</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· Fixed parameter set</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· Collapse on perturbation</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· Requires full recalibration</div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.green, marginBottom: 6 }}>Adaptive Process</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· Maintains response alternatives</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· Stability through perturbation</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>· Recovery without reset</div>
        </div>
      </div>

      {showEvidence && (
        <EvidenceBox
          mechanism="Process state persistence under perturbation"
          controlledVar="Perturbation magnitude and duration"
          measuredOutput="Stability metric, collapse threshold, recovery trajectory"
          significance="Adaptive processes maintain operational continuity where rigid processes require recalibration"
        />
      )}
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EVIDENCE SUMMARY
   ═══════════════════════════════════════════════════════════════════════ */
function EvidenceSummary() {
  const rows = [
    { domain: "Core System", mechanism: "Parallel state persistence", cv: "Hypothesis count", output: "Survival duration, confidence trajectory", sig: "Prevents premature commitment" },
    { domain: "Core System", mechanism: "Similarity-based compression", cv: "Distance threshold", output: "Compression ratio, merge frequency", sig: "Efficiency without information loss" },
    { domain: "Financial", mechanism: "Strategy persistence under regime change", cv: "Regime shift timing", output: "Drawdown, recovery time, switching latency", sig: "Pre-positioned alternatives reduce loss" },
    { domain: "Process", mechanism: "State persistence under perturbation", cv: "Perturbation magnitude", output: "Stability metric, collapse threshold", sig: "Operational continuity without recalibration" },
  ];

  return (
    <Panel title="Evidence Summary" tag="CROSS-DOMAIN">
      <div style={{ fontSize: 13, color: T.textFaint, marginBottom: 16, lineHeight: 1.6 }}>
        Identical structural pattern examined across domains. Each module follows the same
        experimental framework: controlled variable, observed behavior, measured outputs, baseline comparison.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              {["Domain", "Mechanism", "Controlled Variable", "Measured Output", "Significance"].map(h => (
                <th key={h} style={{ padding: "10px 10px", textAlign: "left", fontSize: 10, color: T.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}>
                <td style={{ padding: "10px", color: T.accent, fontWeight: 600 }}>{r.domain}</td>
                <td style={{ padding: "10px", color: T.text }}>{r.mechanism}</td>
                <td style={{ padding: "10px", color: T.textDim }}>{r.cv}</td>
                <td style={{ padding: "10px", color: T.textDim }}>{r.output}</td>
                <td style={{ padding: "10px", color: T.textDim, fontStyle: "italic" }}>{r.sig}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LAB COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function Lab() {
  const [showEvidence, setShowEvidence] = useState(false);
  const sim = useSimulation();

  return (
    <div style={{
      maxWidth: 1140, margin: "0 auto", padding: "48px 32px 96px",
      color: T.text, fontFamily: T.sans,
    }}>
      {/* ── LAYER 1: System Overview ──────────────────────────────── */}
      <SystemOverview />

      {/* ── Evidence Layer Toggle ─────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 20px", borderRadius: 8,
        background: T.surface, border: `1px solid ${T.border}`,
        marginBottom: 40,
      }}>
        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          fontSize: 13, color: T.textDim, userSelect: "none",
        }}>
          <div
            onClick={() => setShowEvidence(!showEvidence)}
            style={{
              width: 38, height: 20, borderRadius: 10, position: "relative",
              background: showEvidence ? T.accent : T.border, cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 2,
              left: showEvidence ? 20 : 2,
              transition: "left 0.2s ease",
            }} />
          </div>
          Show Evidence Layer
        </label>
        {showEvidence && (
          <span style={{ fontSize: 11, color: T.accent }}>
            Evidence annotations visible on all panels
          </span>
        )}
      </div>

      {/* ── LAYER 2: Core System ──────────────────────────────────── */}
      <section id="core-system">
        <SectionDivider label="Layer 2 — Core System" />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: T.text }}>
          Core System: Parallel State Evolution
        </h2>
        <p style={{ fontSize: 14, color: T.textFaint, marginBottom: 24, maxWidth: 700, lineHeight: 1.6 }}>
          A live simulation of competing hypotheses evolving in parallel.
          States are created, evaluated, merged when similar, and retired when confidence drops.
        </p>

        {/* Simulation Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => sim.setRunning(!sim.running)}
            style={{
              padding: "10px 24px", border: `1px solid ${sim.running ? T.amber : T.green}`,
              borderRadius: 6, background: sim.running ? T.amberDim + "22" : T.greenDim + "22",
              color: sim.running ? T.amber : T.green, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {sim.running ? "■ Pause" : "▶ Run System"}
          </button>
          <div style={{ fontSize: 12, color: T.textFaint, fontFamily: T.mono }}>
            tick: {sim.tick} · active: {sim.activeStates.length} · mode: {sim.mode}
          </div>
        </div>

        {/* Core Panels Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 24 }}>
          <StateFormalPanel states={sim.states} showEvidence={showEvidence} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <ActiveCountPanel
            history={sim.history}
            activeCount={sim.activeStates.length}
            totalCreated={sim.totalCreated}
            totalRetired={sim.totalRetired}
            meanSurvival={sim.meanSurvival}
            showEvidence={showEvidence}
          />
          <CompressionPanel
            totalCreated={sim.totalCreated}
            activeCount={sim.activeStates.length}
            totalMerges={sim.totalMerges}
            compressionRatio={sim.compressionRatio}
            mergeLog={sim.mergeLog}
            showEvidence={showEvidence}
          />
        </div>

        {/* Baseline Comparison — full width */}
        <BaselineComparison showEvidence={showEvidence} />
      </section>

      {/* ── LAYER 3: Domain Modules ──────────────────────────────── */}
      <section id="domain-modules">
        <SectionDivider label="Layer 3 — Domain Modules" />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: T.text }}>
          Domain Modules
        </h2>
        <p style={{ fontSize: 14, color: T.textFaint, marginBottom: 24, maxWidth: 700, lineHeight: 1.6 }}>
          The same structural principles applied in distinct technical contexts.
          Each module follows an identical experimental framework.
        </p>

        <FinanceModule showEvidence={showEvidence} />
        <ProcessModule showEvidence={showEvidence} />
      </section>

      {/* ── Evidence Summary ──────────────────────────────────────── */}
      <section id="evidence-summary" style={{ marginTop: 48 }}>
        <SectionDivider label="Evidence" />
        <EvidenceSummary />
      </section>

      {/* ── Existing Lab Pages ───────────────────────────────────── */}
      <section style={{ marginTop: 48 }}>
        <SectionDivider label="Extended Technical Detail" />
        <p style={{ fontSize: 13, color: T.textFaint, marginBottom: 20, lineHeight: 1.6 }}>
          Supporting implementations and detailed system explorations.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {[
            { href: "/lab/phoenix-state.html", title: "Closed-Loop Control", desc: "Live state tracking with competing causal hypotheses." },
            { href: "/lab/multihead.html", title: "Distributed Writer Array", desc: "Parallel control architecture demonstration." },
            { href: "/lab/psf-synthesis.html", title: "PSF Physics", desc: "Coupled spatial-temporal optimization." },
            { href: "/lab/cta-evaluation.html", title: "CTA Evaluation Engine", desc: "Multi-hypothesis decision architecture." },
          ].map(card => (
            <a key={card.href} href={card.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                padding: "18px 20px", border: `1px solid ${T.border}`, borderRadius: T.radius,
                background: T.bg, transition: "border-color 0.15s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHi}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <h4 style={{ margin: "0 0 6px", fontSize: 14, color: T.text }}>{card.title}</h4>
                <p style={{ margin: 0, fontSize: 12, color: T.textFaint, lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer Note ──────────────────────────────────────────── */}
      <div style={{
        marginTop: 64, padding: "20px 24px", borderRadius: T.radius,
        border: `1px solid ${T.border}`, background: T.bg,
        fontSize: 12, color: T.textFaint, lineHeight: 1.7,
      }}>
        <strong style={{ color: T.textDim }}>Methodology Note:</strong>{" "}
        All simulations on this page use abstracted models to demonstrate structural behavior.
        Stochastic elements are bounded and labeled. No claims of production-grade fidelity are made.
        This artifact presents controlled system experiments — not predictions.
      </div>
    </div>
  );
}

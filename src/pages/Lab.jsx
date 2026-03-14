import PageShell from "../components/PageShell";

const labCards = [
  {
    href: "/lab/psf-synthesis.html",
    tag: "CLAIM 4 EVIDENCE",
    tagColor: "#5be6e6",
    tagBg: "#1e5f5f",
    title: "PSF Synthesis",
    desc: "Spatiotemporal exposure compositing: build arbitrary effective PSFs from dithered sub-exposures. Coupled vs. sequential optimization, coherent sharpening, thermal relaxation.",
  },
  {
    href: "/lab/2d-process.html",
    tag: "HEATMAPS",
    tagColor: "#5ba3e6",
    tagBg: "#1e3a5f",
    title: "2D Process Simulation",
    desc: "Interactive lithography pipeline: aerial image, acid map, PEB deprotection, and Mack dissolution rate. Full stochastic EUV exposure model.",
  },
  {
    href: "/lab/3d-pipeline.html",
    tag: "3D INTERACTIVE",
    tagColor: "#a37be6",
    tagBg: "#2d1e5f",
    title: "3D Optical Pipeline",
    desc: "Full beam path from VCSEL source through HHG gas cell to wafer. Gas supply, pressures, power budget, and harmonic generation physics.",
  },
  {
    href: "/lab/fleet-economics.html",
    tag: "DARPA-READY",
    tagColor: "#e6c45b",
    tagBg: "#5f4b1e",
    title: "Fleet Economics",
    desc: "Sensitivity analysis across EUV power levels. ASML power-loss comparison, fleet sizing, CAPEX, and market segment breakdown.",
  },
  {
    href: "/lab/multihead.html",
    tag: "PATENT DEMO",
    tagColor: "#c45be6",
    tagBg: "#3b1e5f",
    title: "Multi-Head Writer",
    desc: "Tiled multi-head array with A/B/C architecture selector, per-tile exposure calculator, stitching zones, and per-site dose calibration.",
  },
  {
    href: "/lab/phoenix-state.html",
    tag: "API STATE",
    tagColor: "#5be6a3",
    tagBg: "#1e5f3a",
    title: "Phoenix Engine State",
    desc: "Adaptive dose correction system status. Active hypotheses, correction factors, and dose tolerance for the Phoenix gating engine.",
  },
];

export default function Lab() {
  return (
    <PageShell>
      <section style={{ marginBottom: "48px" }}>
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.5,
            marginBottom: "12px",
          }}
        >
          Simulation Platform
        </div>

        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          Laser-HHG-EUV Lab
        </h1>

        <p style={{ fontSize: "20px", maxWidth: "860px", opacity: 0.9 }}>
          Chip-scale coherent EUV source simulation platform. Interactive
          visualizations of lithography physics, multi-head writer architectures,
          PSF synthesis, and fleet economics.
        </p>
      </section>

      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "22px",
          }}
        >
          {labCards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  padding: "24px",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  background: "#0f172a",
                  height: "100%",
                  transition:
                    "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "#334155";
                  e.currentTarget.style.boxShadow =
                    "0 8px 30px rgba(74,108,247,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#1e293b";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    color: card.tagColor,
                    background: card.tagBg,
                    marginBottom: "14px",
                  }}
                >
                  {card.tag}
                </span>

                <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
                  {card.title}
                </h3>

                <p
                  style={{
                    opacity: 0.82,
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: "56px",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          background: "#111827",
        }}
      >
        <h2 style={{ marginTop: 0 }}>About the Lab</h2>

        <p style={{ opacity: 0.88, maxWidth: "920px", lineHeight: 1.7 }}>
          Each visualization is a self-contained interactive page powered by
          Plotly.js. Hover over data points for details, zoom into regions of
          interest, and use the control panels to explore parameter spaces. The
          PSF Synthesis page contains the simulation evidence for the
          spatiotemporal compositing patent — demonstrating quantitative proof
          that coupled spatial-temporal optimization produces materially better
          results than sequential independent optimization.
        </p>
      </section>
    </PageShell>
  );
}

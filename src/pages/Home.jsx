import PageShell from "../components/PageShell";

export default function Home() {
  return (
    <PageShell>
      {/* HERO / INTRO */}
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "44px", marginBottom: "12px" }}>
          IndustriallyStrong
        </h1>

        <p
          style={{
            fontSize: "20px",
            lineHeight: "1.7",
            maxWidth: "860px",
            opacity: 0.9,
          }}
        >
          Exploring how architecture determines the behavior of complex systems —
          from AI reasoning infrastructure to experimental physical system
          architectures.
        </p>
      </section>

      {/* Research directions */}
      <section style={{ marginTop: "80px", marginBottom: "80px" }}>
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: "12px",
          }}
        >
          Research directions
        </div>

        <h2 style={{ fontSize: "34px", marginBottom: "14px" }}>
          Architecture determines how systems scale
        </h2>

        <p
          style={{
            maxWidth: "820px",
            fontSize: "18px",
            lineHeight: "1.7",
            marginBottom: "28px",
          }}
        >
          IndustriallyStrong explores architectural approaches to complex
          systems — from AI reasoning platforms to physical system architectures
          such as modular lithography exposure systems.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginTop: "18px",
          }}
        >
          {/* AI Architecture */}
          <a
            href="/architecture"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "18px",
              padding: "22px",
              textDecoration: "none",
              color: "inherit",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "18px",
                marginBottom: "6px",
              }}
            >
              AI System Architecture
            </div>

            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              Deployed applications, agent reasoning layers, evidence retrieval,
              and operational system design.
            </div>
          </a>

          {/* Lithography */}
          <a
            href="/lithography"
            style={{
              border: "1px solid rgba(120,180,255,0.28)",
              borderRadius: "18px",
              padding: "22px",
              textDecoration: "none",
              color: "inherit",
              background: "rgba(120,180,255,0.05)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "18px",
                marginBottom: "6px",
              }}
            >
              <div
  style={{
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    opacity: 0.72,
    marginBottom: "8px",
  }}
>
  Physical systems
</div>
            </div>

            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              Parallel exposure architectures, modular writers, and multi-wafer
              throughput models for future lithography systems.
            </div>
          </a>
        </div>
      </section>

      {/* Core Systems */}
      <section style={{ marginTop: "72px", marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "28px" }}>Core Systems</h2>

        <p
          style={{
            maxWidth: "820px",
            fontSize: "18px",
            lineHeight: "1.7",
            opacity: 0.85,
          }}
        >
          Explore the architecture, experiments, and research directions that
          connect deployed applications, reasoning systems, and technical
          exploration.
        </p>
      </section>
    </PageShell>
  );
}

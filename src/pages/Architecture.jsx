import PageShell from "../components/PageShell";
import PrimaryButton from "../components/PrimaryButton";
import architectureSystemDiagram from "../assets/architecture-system-diagram.svg";

export default function Architecture() {
  return (
    <PageShell>
      <section style={{ marginBottom: "60px" }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "18px",
            padding: "28px 24px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <h3 style={{ fontSize: "24px", marginBottom: "14px" }}>
            System flow
          </h3>

          <p style={{ margin: "0 0 20px", lineHeight: 1.7, opacity: 0.84 }}>
            IndustriallyStrong connects deployed applications, agent orchestration,
            evidence handling, and research infrastructure into a unified operating
            model.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              alignItems: "stretch",
            }}
          >
            {[
              "Deployed Applications",
              "Agent Orchestration",
              "Evidence and Retrieval",
              "Research Infrastructure",
            ].map((item) => (
              <div
                key={item}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "18px 16px",
                  background: "rgba(255,255,255,0.02)",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          marginBottom: "52px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderLeft: "4px solid rgba(255,255,255,0.55)",
          borderRadius: "18px",
          padding: "28px 24px",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: 0.72,
            marginBottom: "12px",
          }}
        >
          Why this architecture matters
        </div>

        <h2
          style={{
            fontSize: "30px",
            lineHeight: 1.15,
            marginBottom: "14px",
            maxWidth: "900px",
          }}
        >
          A production-oriented AI architecture for systems that must reason,
          not just respond.
        </h2>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.65,
            maxWidth: "900px",
            opacity: 0.9,
            marginBottom: "24px",
          }}
        >
          IndustriallyStrong connects deployed applications, agent-driven
          analysis, and research infrastructure into a single operating model.
          The goal is not another isolated demo, but a technical stack that
          supports explainable reasoning, resilient workflows, and real-world
          deployment.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "18px 16px",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
              Live system path
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.82 }}>
              Frontend, backend, and interactive workflow connected as an
              operating system rather than a static concept.
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "18px 16px",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
              Agent-driven reasoning
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.82 }}>
              Structured analysis and orchestration designed for uncertainty
              rather than prompt-only output.
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "18px 16px",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
              Research-backed architecture
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.82 }}>
              Designed to bridge working software systems with deeper research
              directions and experimental infrastructure.
            </div>
          </div>
        </div>

        <div style={{ fontSize: "15px", opacity: 0.72 }}>
          Start with the architecture diagram below, then explore the live demo
          and research paths.
        </div>
      </section>

      <section style={{ marginBottom: "60px" }}>
        <div
          style={{
            marginTop: "24px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "22px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.02)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          }}
        >
          <img
            src={architectureSystemDiagram}
            alt="IndustriallyStrong system architecture diagram"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
      </section>

      <section style={{ marginTop: "60px", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
          Architecture Thinking Beyond Software
        </h2>

        <p style={{ maxWidth: "900px", fontSize: "18px", lineHeight: "1.7" }}>
          Architectural reasoning applies not only to software systems but also
          to physical systems. One current exploration considers whether
          lithography systems could scale through modular exposure architectures
          rather than only through increasingly large optical machines.
        </p>

        <div style={{ marginTop: "18px" }}>
          <a
            href="/lithography"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.14)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Explore Modular Lithography →
          </a>
        </div>
      </section>
    </PageShell>
  );
}

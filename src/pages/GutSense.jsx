import { trackEvent } from "../utils/analytics";
import PageShell from "../components/PageShell";

export default function GutSense() {
  return (
    <PageShell>
      <section style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>GutSense</h1>

        <p style={{ fontSize: "20px", maxWidth: "850px", opacity: 0.9 }}>
          GutSense is a multi-agent dietary intelligence system designed to
          evaluate foods against FODMAP sensitivity, allergens, and individual
          dietary constraints.
        </p>

        <a
          href="https://gutsense.industriallystrong.com"
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("navigation", "gutsense_web_launch")}
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "14px 24px",
            border: "1px solid #334155",
            borderRadius: "10px",
            textDecoration: "none",
            color: "white",
            background: "#111827",
            fontWeight: 600,
            fontSize: "15px",
            letterSpacing: "0.02em",
            transition: "background 0.18s ease, border-color 0.18s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#5B8DEF";
            e.currentTarget.style.background = "#172033";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#334155";
            e.currentTarget.style.background = "#111827";
          }}
        >
          Launch GutSense Web →
        </a>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>What it does</h2>

        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          GutSense combines multiple AI models to analyze food composition,
          dietary risk factors, and personal sensitivities. The system
          synthesizes outputs from several models into a unified evaluation
          surface for the user.
        </p>

        <ul style={{ opacity: 0.82 }}>
          <li>Food sensitivity evaluation</li>
          <li>Allergen and FODMAP analysis</li>
          <li>Multi-agent AI synthesis</li>
          <li>Mobile delivery via SwiftUI</li>
          <li>Web companion via Next.js + FastAPI</li>
        </ul>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Architecture</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>iOS client</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              SwiftUI application for user interaction.
            </p>
          </div>

          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>Backend</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              Railway-hosted service orchestrating model analysis.
            </p>
          </div>

          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>Claude + Gemini</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              External model evaluation and reasoning.
            </p>
          </div>

          <div style={{ border: "1px solid #243041", borderRadius: "12px", padding: "18px" }}>
            <strong>Apple Foundation Models</strong>
            <p style={{ opacity: 0.8, marginBottom: 0 }}>
              On-device intelligence for synthesis and response.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Status</h2>

        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          GutSense operates as a private iOS application in tester access with a
          live backend. The{" "}
          <a
            href="https://gutsense.industriallystrong.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#5B8DEF", textDecoration: "none" }}
          >
            web companion
          </a>{" "}
          is publicly accessible for food analysis. Multi-agent architecture
          continues to evolve across both platforms.
        </p>
      </section>
    </PageShell>
  );
}

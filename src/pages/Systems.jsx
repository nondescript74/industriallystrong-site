import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

export default function Systems() {
  return (
    <PageShell>
      <div>
        <section style={{ marginBottom: "60px" }}>
          <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>Systems</h1>

          <p style={{ fontSize: "20px", maxWidth: "800px", opacity: 0.9 }}>
            IndustriallyStrong connects concept development with real systems.
            These projects represent deployed or actively developed platforms
            spanning AI decision systems, research infrastructure, and applied
            intelligence tools.
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
          }}
        >
          <div
            style={{
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "26px",
            }}
          >
            <h2>
              <Link
                to="/systems/qrlphoenix"
                style={{ color: "white", textDecoration: "none" }}
              >
                QRLPhoenix
              </Link>
            </h2>

            <p style={{ opacity: 0.85 }}>
              iOS strategy intelligence platform combining AI agents with
              quantitative research techniques to discover and analyze public
              trading strategies.
            </p>

            <ul style={{ opacity: 0.8 }}>
              <li>Multi-agent analysis (Claude + others)</li>
              <li>Strategy discovery and evaluation</li>
              <li>MHT-FAISS research integration</li>
            </ul>
          </div>

          <div
            style={{
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "26px",
            }}
          >
            <h2>
              <Link
                to="/systems/gutsense"
                style={{ color: "white", textDecoration: "none" }}
              >
                GutSense
              </Link>
            </h2>

            <p style={{ opacity: 0.85 }}>
              Multi-agent dietary intelligence system designed to help users
              evaluate foods for FODMAP sensitivity, allergens, and personal
              dietary constraints.
            </p>

            <ul style={{ opacity: 0.8 }}>
              <li>Claude + Gemini synthesis</li>
              <li>Apple on-device intelligence</li>
              <li>Food risk evaluation agents</li>
            </ul>
          </div>

          <div
            style={{
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "26px",
            }}
          >
            <h2>MHT-FAISS Engine</h2>

            <p style={{ opacity: 0.85 }}>
              Real-time research engine exploring large hypothesis spaces for
              financial strategies using multi-hypothesis tracking combined with
              FAISS-based vector search.
            </p>

            <ul style={{ opacity: 0.8 }}>
              <li>High-dimensional state exploration</li>
              <li>Research and visualization surface</li>
              <li>Strategy analysis backend for QRLPhoenix</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

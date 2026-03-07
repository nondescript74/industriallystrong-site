import PageShell from "../components/PageShell";
import CardLink from "../components/CardLink";

export default function Systems() {
  return (
    <PageShell>
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>Systems</h1>

        <p style={{ fontSize: "20px", maxWidth: "860px", opacity: 0.9 }}>
          IndustriallyStrong systems connect deployed applications, research
          infrastructure, and AI-assisted workflows. These platforms are built
          to demonstrate practical architecture while exploring new approaches
          to intelligence systems.
        </p>
      </section>

      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "22px",
          }}
        >
          <CardLink to="/systems/qrlphoenix" title="QRLPhoenix">
            <p style={{ margin: 0 }}>
              AI-assisted iOS strategy discovery and evaluation platform built
              around agent analysis, structured review workflows, and research
              infrastructure.
            </p>
          </CardLink>

          <CardLink to="/systems/gutsense" title="GutSense">
            <p style={{ margin: 0 }}>
              Multi-agent dietary intelligence platform combining Claude,
              Gemini, and Apple Foundation Models to evaluate foods against
              FODMAP sensitivity, allergens, and personal dietary constraints.
            </p>
          </CardLink>

          <CardLink to="/research" title="MHT-FAISS Strategy Engine">
            <p style={{ margin: 0 }}>
              Research infrastructure supporting large-scale strategy
              exploration using Multiple Hypothesis Tracking and FAISS-based
              vector search.
            </p>
          </CardLink>
        </div>
      </section>
    </PageShell>
  );
}

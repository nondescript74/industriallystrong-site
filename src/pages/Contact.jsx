import PageShell from "../components/PageShell";

export default function Contact() {
  return (
    <PageShell>
      <section style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>Contact</h1>
        <p style={{ fontSize: "20px", maxWidth: "850px", opacity: 0.9 }}>
          IndustriallyStrong is open to conversations around technical
          architecture, AI systems, fintech infrastructure, and research-driven
          product development.
        </p>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>What to reach out about</h2>
        <ul style={{ opacity: 0.82 }}>
          <li>AI system architecture and technical strategy</li>
          <li>Fintech intelligence and research systems</li>
          <li>Multi-agent application design</li>
          <li>Program concepts and advanced technical initiatives</li>
        </ul>
      </section>

      <section
        style={{
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Current contact path</h2>
        <p style={{ opacity: 0.88, maxWidth: "900px" }}>
          For now, the best contact path is LinkedIn while the direct site
          contact workflow is being refined.
        </p>
        <p>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              border: "1px solid #334155",
              borderRadius: "10px",
              textDecoration: "none",
              color: "white",
              background: "#111827",
            }}
          >
            Connect on LinkedIn
          </a>
        </p>
      </section>
    </PageShell>
  );
}

export default function Home() {
  return (
    <div>
      <section 
        style={{
          padding: "80px 0",
          borderBottom: "1px solid #1e293b"
        }}
      >
        <h1 
          style={{
            fontSize: "48px",
            marginBottom: "20px"
          }}
        >
          IndustriallyStrong
        </h1>

        <p 
          style={{
            fontSize: "20px",
            maxWidth: "900px",
            opacity: 0.9
          }}
        >
          Systems, research architectures, and program concepts for organizations
          capable of executing at scale.
        </p>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Program thesis</h2>
        <p>
          IndustriallyStrong is a technical and strategic surface for framing
          advanced concepts, presenting real systems, and connecting research to
          deployable architecture.
        </p>
        <p>
          The site is not intended as a conventional product brochure. It is a
          platform for communicating technical direction, live system evidence,
          and program-level thinking across fintech, AI applications, and
          research-driven infrastructure.
        </p>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Current fronts</h2>
        <ul>
          <li>DARPA-style program concepts and technical framing</li>
          <li>Fintech intelligence and strategy analysis systems</li>
          <li>Multi-agent AI applications for decision support</li>
          <li>Research systems including MHT-FAISS exploration engines</li>
        </ul>
      </section>

      <section style={{ marginTop: "60px" }}>
        <h2>Live systems</h2>

        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginTop: "30px"
          }}
        >
          <div 
            style={{ 
              padding: "20px", 
              border: "1px solid #1e293b", 
              borderRadius: "10px" 
            }}
          >
            <h3>QRLPhoenix</h3>
            <p>AI-assisted iOS strategy discovery platform.</p>
          </div>

          <div 
            style={{ 
              padding: "20px", 
              border: "1px solid #1e293b", 
              borderRadius: "10px" 
            }}
          >
            <h3>GutSense</h3>
            <p>Multi-agent dietary intelligence system.</p>
          </div>

          <div 
            style={{ 
              padding: "20px", 
              border: "1px solid #1e293b", 
              borderRadius: "10px" 
            }}
          >
            <h3>MHT-FAISS Engine</h3>
            <p>Real-time strategy hypothesis exploration system.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

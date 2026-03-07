export default function Systems() {
  return (
    <div>
      <h1>Systems</h1>
      <p>
        Live and emerging systems developed across AI applications, strategy
        intelligence, and production-grade orchestration.
      </p>

      <section style={{ marginTop: "40px" }}>
        <h2>QRLPhoenix</h2>
        <p>
          QRLPhoenix is an iOS strategy intelligence system designed to find,
          organize, and analyze publicly available and newly created trading
          strategies using AI-assisted workflows.
        </p>
        <p>
          The platform is supported by a Railway-hosted backend and is currently
          in controlled tester access.
        </p>
        <ul>
          <li>Domain: fintech / strategy intelligence</li>
          <li>Client: SwiftUI iOS application</li>
          <li>Backend: Railway</li>
          <li>Status: internal / invited testers</li>
        </ul>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>GutSense</h2>
        <p>
          GutSense is a dietary intelligence system built to evaluate foods for
          FODMAP sensitivity and allergen concerns through a multi-agent AI
          architecture.
        </p>
        <p>
          The system synthesizes outputs from Claude, Gemini, and Apple
          Foundation Models to produce a consolidated evaluation surface for the
          user.
        </p>
        <ul>
          <li>Domain: food intelligence / health decision support</li>
          <li>Client: SwiftUI iOS application</li>
          <li>Backend: Railway</li>
          <li>Status: internal testers</li>
        </ul>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Public-facing app surface</h2>
        <p>
          A lightweight public landing surface also exists for the QRLPhoenix
          App Clip and release path.
        </p>
        <p>
          <a
            href="https://newthing-production.up.railway.app"
            target="_blank"
            rel="noreferrer"
          >
            View QRLPhoenix App Clip landing page
          </a>
        </p>
      </section>
    </div>
  );
}

export default function Research() {
  return (
    <div>
      <h1>Research</h1>
      <p>
        Research systems and technical demonstrations that underpin larger
        application and platform concepts.
      </p>

      <section style={{ marginTop: "40px" }}>
        <h2>MHT-FAISS Strategy Engine</h2>
        <p>
          A real-time research and demonstration system for exploring strategy
          populations using Multiple Hypothesis Tracking and FAISS-based vector
          search across large candidate sets.
        </p>
        <p>
          This engine provides an interactive surface for examining strategies
          previously filtered or evaluated by AI agents and for observing
          branching, ranking, and pruning behavior in high-dimensional state
          spaces.
        </p>
        <ul>
          <li>Domain: fintech / market intelligence</li>
          <li>Core ideas: MHT, FAISS, real-time hypothesis exploration</li>
          <li>Deployment: Railway</li>
          <li>Role: public technical demo</li>
        </ul>

        <p style={{ marginTop: "20px" }}>
          <a
            href="https://web-production-06a1.up.railway.app"
            target="_blank"
            rel="noreferrer"
          >
            View live MHT-FAISS demo
          </a>
        </p>
      </section>
    </div>
  );
}

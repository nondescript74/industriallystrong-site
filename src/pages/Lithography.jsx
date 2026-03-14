import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import "../assets/lithographyStory.css";

import lithographyArchitectureDiagram from "../assets/lithography-architecture-diagram.svg";
import multiWaferModularScanningDiagram from "../assets/multi-wafer-modular-scanning-diagram.svg";
import darpaModularSourceStackDiagram from "../assets/darpa-modular-source-stack-diagram.svg";

export default function Lithography() {
  return (
    <PageShell>

      {/* HERO */}
      <section className="story-hero">

        <div className="story-eyebrow">
          Concept Exploration
        </div>

        <h1>
          Modular Lithography
          <br />
          Scaling Exposure Systems Like Semiconductors
        </h1>

        <p className="story-lead">
          A research architecture exploring whether lithography throughput could
          scale through distributed exposure modules, shared scanning platforms,
          and multi-wafer processing rather than through increasingly large
          monolithic optical systems.
        </p>

      </section>


      {/* ARCHITECTURAL CONTRAST */}
      <section className="story-section">

        <div className="story-eyebrow">
          Architectural comparison
        </div>

        <h2>
          Two fundamentally different scaling models
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            marginTop: "24px",
          }}
        >

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
              padding: "22px",
              background: "rgba(255,255,255,0.02)",
            }}
          >

            <div style={{ fontWeight: 700, marginBottom: "10px" }}>
              Traditional lithography scaling
            </div>

            <ul style={{ lineHeight: 1.7, opacity: 0.85 }}>
              <li>Single exposure system</li>
              <li>Single wafer stage</li>
              <li>Single reticle stage</li>
              <li>Throughput increases through optical precision</li>
              <li>Machine size and complexity increase</li>
            </ul>

          </div>

          <div
            style={{
              border: "1px solid rgba(120,180,255,0.35)",
              borderRadius: "18px",
              padding: "22px",
              background: "rgba(120,180,255,0.05)",
            }}
          >

            <div style={{ fontWeight: 700, marginBottom: "10px" }}>
              Modular lithography scaling
            </div>

            <ul style={{ lineHeight: 1.7, opacity: 0.9 }}>
              <li>Many independent exposure writers</li>
              <li>Local alignment per exposure module</li>
              <li>Shared scanning apparatus</li>
              <li>Multiple wafers processed simultaneously</li>
              <li>Throughput scales through parallelism</li>
            </ul>

          </div>

        </div>

      </section>


      {/* INTRODUCTION */}
      <section className="story-section">

        <p>
          Lithography systems historically scale through increasingly
          sophisticated optics and mechanical precision. This approach has
          produced extraordinary machines, but also extremely large and complex
          system architectures.
        </p>

        <p>
          Semiconductor devices scale through replication and parallelism.
          Lithography systems historically scale through precision and optical
          complexity.
        </p>

        <p>
          This raises an architectural question: could exposure systems scale in
          a similar way — by increasing the number of programmable exposure
          modules rather than continuously increasing the size and precision of
          a single optical machine?
        </p>

      </section>


      {/* FIRST DIAGRAM */}
      <section className="story-section">

        <div className="story-eyebrow">
          Visual architecture
        </div>

        <h2>
          From Monolithic Optical Scaling to Modular Exposure Scaling
        </h2>

        <p>
          Traditional lithography scales through optics and mechanics. A
          modular architecture could instead scale through replicated exposure
          elements, distributed control, and parallel wafer handling.
        </p>

        <div className="lithography-diagram-frame">

          <img
            src={lithographyArchitectureDiagram}
            alt="Traditional monolithic scanner versus modular lithography architecture"
            className="lithography-diagram-image"
          />

        </div>

      </section>


      {/* MULTI WRITER */}
      <section className="story-section">

        <div className="story-eyebrow">
          Throughput architecture
        </div>

        <h2>
          Multiple Writers on a Shared Apparatus
        </h2>

        <p>
          The modular concept becomes more significant when independently
          aligned writers are distributed across a shared scanning apparatus.
          The result is not simply many writing elements, but a fundamentally
          different throughput model in which multiple wafer regions — and
          potentially multiple wafers — can be serviced within a coordinated
          machine architecture.
        </p>

        <div className="lithography-diagram-frame">

          <img
            src={multiWaferModularScanningDiagram}
            alt="Shared scanning apparatus with multiple writer modules and multiple wafers"
            className="lithography-diagram-image"
          />

        </div>

      </section>


      {/* PROGRAM ARCHITECTURE */}
      <section className="story-section">

        <div className="story-eyebrow">
          Program architecture
        </div>

        <h2>
          Enabling Stack for a Modular Exposure Program
        </h2>

        <p>
          Viewed as a research program, a modular exposure architecture
          decomposes into several enabling layers: semiconductor source
          generation, MEMS steering and local alignment, vacuum and thermal
          packaging, and system-level orchestration.
        </p>

        <p>
          Breaking the concept into these layers clarifies both feasibility
          questions and research directions.
        </p>

        <div className="lithography-diagram-frame">

          <img
            src={darpaModularSourceStackDiagram}
            alt="Research architecture layers for modular lithography system"
            className="lithography-diagram-image"
          />

        </div>

      </section>


      {/* ARCHITECTURAL THESIS */}
      <section className="story-section">

        <div className="story-eyebrow">
          Architectural thesis
        </div>

        <p>
          The central thesis is architectural: if exposure capability can be
          replicated and distributed the way semiconductor devices themselves
          are, lithography systems may eventually scale through parallel
          modularity rather than primarily through monolithic optical
          complexity.
        </p>

      </section>


      {/* LAB LINK */}
      <section className="story-section">

        <div className="story-eyebrow">
          Interactive simulations
        </div>

        <h2>
          EUV Lab Visualizer
        </h2>

        <p>
          Explore the physics behind modular lithography through interactive
          simulations — PSF synthesis, multi-head writer arrays, beam
          propagation, fleet economics, and more.
        </p>

        <Link
          to="/lab"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "rgba(120,180,255,0.15)",
            border: "1px solid rgba(120,180,255,0.35)",
            borderRadius: "8px",
            color: "#93c5fd",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "15px",
            marginTop: "8px",
          }}
        >
          Open the Lab →
        </Link>

      </section>


      {/* OPEN QUESTIONS */}
      <section className="story-section">

        <h2>
          Open Research Questions
        </h2>

        <ul>

          <li>
            What emitter technologies could support modular exposure arrays?
          </li>

          <li>
            How should distributed beam alignment be implemented?
          </li>

          <li>
            Can MEMS structures support beam steering and focus control?
          </li>

          <li>
            How would cooling and vacuum architecture scale with module density?
          </li>

          <li>
            How should software coordinate many semi-independent writing
            elements?
          </li>

        </ul>

      </section>

    </PageShell>
  );
}

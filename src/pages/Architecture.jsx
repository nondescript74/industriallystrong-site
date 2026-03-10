import PageShell from "../components/PageShell";
import "../assets/lithographyStory.css";

function Section({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`litho-section ${className}`}>
      <div className="litho-section-inner">
        {eyebrow ? <div className="litho-eyebrow">{eyebrow}</div> : null}
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    </section>
  );
}

export default function Architecture() {
  return (
    <PageShell>
      <main className="litho-page">
        <section className="litho-hero">
          <div className="litho-hero-inner">
            <div className="litho-eyebrow">IndustriallyStrong Research</div>
            <h1>
              What if lithography scaled
              <br />
              like semiconductors?
            </h1>
            <p className="litho-hero-copy">
              A lithography thesis built around tiled semiconductor exposure
              modules instead of a single large exposure engine.
            </p>
          </div>
        </section>

        <Section
          eyebrow="The trajectory"
          title="Lithography has historically scaled by building larger and more complex machines."
          className="narrative"
        >
          <div className="trajectory-strip">
            <div className="trajectory-card">
              <span>Optical steppers</span>
            </div>
            <div className="trajectory-arrow">→</div>
            <div className="trajectory-card">
              <span>DUV scanners</span>
            </div>
            <div className="trajectory-arrow">→</div>
            <div className="trajectory-card emphasis">
              <span>EUV mega-systems</span>
            </div>
          </div>

          <p className="lede">
            More optical complexity. More source complexity. More machine
            complexity.
          </p>
        </Section>

        <Section
          eyebrow="The question"
          title="What if the exposure system itself were built as a semiconductor structure?"
          className="question"
        >
          <div className="question-grid">
            <div className="question-left">
              <div className="machine-silhouette">
                <div className="machine-core" />
                <div className="machine-optic optic-a" />
                <div className="machine-optic optic-b" />
                <div className="machine-stage" />
              </div>
              <div className="question-label">Monolithic exposure engine</div>
            </div>

            <div className="question-divider">→</div>

            <div className="question-right">
              <div className="module-cluster">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="question-label">
                Distributed semiconductor modules
              </div>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Architecture"
          title="A tiled exposure surface built from writer heads."
          className="architecture"
        >
          <p className="section-copy">
            Each writer head controls a local field. Larger patterning regions
            are formed through tiling, stitching, and substrate motion.
          </p>

          <div className="writer-architecture">
            <div className="writer-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="writer-tile" key={i}>
                  <div className="writer-title">Exposure Head</div>
                  <div className="writer-layers">
                    <span>Optics</span>
                    <span>MEMS</span>
                    <span>Array</span>
                    <span>Control</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="beam-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="beam-group" key={i}>
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </div>

            <div className="wafer-band">
              <div className="wafer-pattern">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="wafer-label">Resist-coated wafer</div>
            </div>

            <div className="micro-caption">
              Many programmable exposure elements operating in parallel.
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Writer head"
          title="The writer head should read as semiconductor hardware."
          className="cross-section-panel"
        >
          <p className="section-copy">
            The concept becomes more credible when the writer head is framed as
            a layered semiconductor module rather than an abstract light source.
          </p>

          <div className="cross-section-card">
            <div className="cross-layer optics">Optical conditioning layer</div>
            <div className="cross-layer mems">MEMS steering layer</div>
            <div className="cross-layer emitters">Emitter / modulation array</div>
            <div className="cross-layer asic">
              Driver electronics + timing control
            </div>
            <div className="cross-layer thermal">Thermal / power substrate</div>

            <div className="cross-beams">
              <span />
              <span />
              <span />
            </div>

            <div className="cross-wafer">Wafer exposure plane</div>
          </div>
        </Section>

        <Section
          eyebrow="Feasibility"
          title="Can enough energy reach the wafer?"
          className="feasibility"
        >
          <p className="section-copy">
            A first-order estimate suggests the photon budget may be workable.
            <br />
            The harder problem is synchronization, calibration, stitching, and
            control.
          </p>

          <div className="energy-stage-row">
            <div className="energy-stage wall">
              <div className="energy-top">Wall plug</div>
              <div className="energy-big">100 W</div>
            </div>
            <div className="energy-arrow">↓</div>
            <div className="energy-stage optical">
              <div className="energy-top">Optical generation</div>
              <div className="energy-big">~30 W</div>
            </div>
            <div className="energy-arrow">↓</div>
            <div className="energy-stage conditioning">
              <div className="energy-top">Conditioned beam</div>
              <div className="energy-big">~22 W</div>
            </div>
            <div className="energy-arrow">↓</div>
            <div className="energy-stage wafer">
              <div className="energy-top">Power at wafer</div>
              <div className="energy-big">~16 W</div>
            </div>
          </div>

          <div className="throughput-panel">
            <div className="throughput-formula">Area rate = Power / Resist dose</div>
            <div className="throughput-stats">
              <div>
                <span>Illustrative resist dose</span>
                <strong>20 mJ/cm²</strong>
              </div>
              <div>
                <span>Photon-limited capacity</span>
                <strong>~700–800 cm²/s</strong>
              </div>
              <div className="wide">
                <span>Dominant system constraints</span>
                <strong>
                  Synchronization · alignment · stitching · calibration · control
                </strong>
              </div>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Landscape"
          title="This is a different scaling path from monolithic scanner development."
          className="landscape"
        >
          <p className="section-copy">
            The concept sits in a different lane: distributed, tiled exposure
            rather than a single centralized tool.
          </p>

          <div className="industry-map-card">
            <div className="map-y-label">Programmable patterning</div>
            <div className="industry-map">
              <div className="axis-y" />
              <div className="axis-x" />

              <div className="map-item euv">
                <strong>EUV scanners</strong>
                <span>Monolithic machines</span>
              </div>

              <div className="map-item nil">
                <strong>Nanoimprint</strong>
                <span>Replication path</span>
              </div>

              <div className="map-item maskless">
                <strong>Maskless direct write</strong>
                <span>Flexible, narrower parallelism</span>
              </div>

              <div className="map-item distributed">
                <strong>Distributed semiconductor lithography</strong>
                <span>Tiled programmable modules</span>
              </div>

              <div className="map-x-label">
                Monolithic machine → distributed semiconductor architecture
              </div>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Scaling"
          title="Architecture determines how lithography scales."
          className="scaling"
        >
          <div className="scaling-comparison">
            <div className="scaling-side">
              <div className="scaling-side-title">Monolithic lithography systems</div>
              <div className="scaling-machine" />
              <div className="scaling-chain">
                <span>Higher resolution</span>
                <span>↓</span>
                <span>More optical complexity</span>
                <span>↓</span>
                <span>Larger machines</span>
              </div>
              <div className="scaling-note">
                Scaling through optical complexity
              </div>
            </div>

            <div className="scaling-side">
              <div className="scaling-side-title">
                Distributed lithography architecture
              </div>
              <div className="scaling-modules">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="scaling-chain">
                <span>Higher throughput</span>
                <span>↓</span>
                <span>More exposure modules</span>
                <span>↓</span>
                <span>Parallel scaling</span>
              </div>
              <div className="scaling-note">
                Scaling through semiconductor integration
              </div>
            </div>
          </div>
        </Section>

        <section className="final-thesis">
          <div className="final-thesis-inner">
            <div className="litho-eyebrow">Thesis</div>
            <h2>
              Lithography may eventually scale not through larger optical
              machines, but through semiconductor-manufacturable exposure
              modules.
            </h2>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

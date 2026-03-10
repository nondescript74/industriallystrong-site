import PageShell from "../components/PageShell";
import "../assets/lithographyStory.css";

export default function Architecture() {
  return (
    <PageShell>
      <div className="litho-story">
        <section className="litho-hero">
          <div className="litho-eyebrow">IndustriallyStrong Research</div>
          <h1>Programmable Lithography Architectures</h1>
          <p className="litho-hero-copy">
            Exploring a semiconductor-manufacturable lithography direction built
            from tiled exposure modules rather than a single monolithic exposure
            engine.
          </p>
        </section>

        <section className="litho-panel">
          <div className="litho-panel-inner">
            <div className="litho-kicker">The question</div>
            <h2>What if lithography scaled like semiconductors?</h2>
            <p>
              For decades, lithography has scaled through larger optics, more
              complex sources, and increasingly sophisticated machines.
            </p>
            <p>
              This concept explores a different architectural path: exposure
              systems composed of many programmable modules operating in
              parallel.
            </p>
          </div>
        </section>

        <section className="litho-panel">
          <div className="litho-panel-inner">
            <div className="litho-kicker">Concept</div>
            <h2>Tiled exposure architecture</h2>
            <p className="litho-section-copy">
              A distributed exposure surface formed from multiple writer heads,
              each responsible for a local field.
            </p>

            <div className="tile-architecture">
              <div className="tile-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className="writer-head" key={i}>
                    <div className="writer-head-title">Writer Head</div>
                    <div className="writer-head-stack">
                      <span>Optics</span>
                      <span>MEMS</span>
                      <span>Array</span>
                      <span>ASIC</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="beam-row">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className="beam-group" key={i}>
                    <span />
                    <span />
                    <span />
                  </div>
                ))}
              </div>

              <div className="wafer-stage">
                <div className="wafer-stage-label">Photoresist wafer</div>
              </div>

              <div className="tile-caption">
                Many programmable exposure elements operating simultaneously.
              </div>
            </div>
          </div>
        </section>

        <section className="litho-panel">
          <div className="litho-panel-inner">
            <div className="litho-kicker">Fabrication plausibility</div>
            <h2>Semiconductor writer-head structure</h2>
            <p className="litho-section-copy">
              The core idea is not a giant optical machine, but a layered module
              that looks like semiconductor hardware.
            </p>

            <div className="cross-section">
              <div className="layer optics">Optical conditioning layer</div>
              <div className="layer mems">MEMS steering layer</div>
              <div className="layer emitters">Emitter / modulation array</div>
              <div className="layer electronics">
                Driver electronics + timing control
              </div>
              <div className="layer thermal">Thermal / power substrate</div>

              <div className="cross-section-beams">
                <span />
                <span />
                <span />
              </div>

              <div className="cross-wafer">Wafer exposure plane</div>
            </div>
          </div>
        </section>

        <section className="litho-panel">
          <div className="litho-panel-inner">
            <div className="litho-kicker">Feasibility</div>
            <h2>Wall plug → wafer</h2>
            <p className="litho-section-copy">
              A first-order engineering model suggests that photon budget may
              not be the dominant constraint. System synchronization,
              calibration, stitching, and control can matter just as much.
            </p>

            <div className="energy-flow">
              <div className="energy-bar wall">
                <div className="energy-label">Wall plug</div>
                <div className="energy-value">100 W</div>
              </div>
              <div className="energy-arrow">↓</div>
              <div className="energy-bar optical">
                <div className="energy-label">Optical generation</div>
                <div className="energy-value">~30 W</div>
              </div>
              <div className="energy-arrow">↓</div>
              <div className="energy-bar conditioning">
                <div className="energy-label">Conditioned beam</div>
                <div className="energy-value">~22 W</div>
              </div>
              <div className="energy-arrow">↓</div>
              <div className="energy-bar wafer">
                <div className="energy-label">Power at wafer</div>
                <div className="energy-value">~16 W</div>
              </div>
            </div>

            <div className="throughput-card">
              <div className="throughput-title">Illustrative throughput model</div>
              <div className="throughput-formula">Area rate = Power / Resist dose</div>
              <div className="throughput-grid">
                <div>
                  <span className="throughput-key">Power at wafer</span>
                  <strong>~16 W</strong>
                </div>
                <div>
                  <span className="throughput-key">Example resist dose</span>
                  <strong>20 mJ/cm²</strong>
                </div>
                <div>
                  <span className="throughput-key">Photon-limit capacity</span>
                  <strong>~700–800 cm²/s</strong>
                </div>
                <div>
                  <span className="throughput-key">Real constraint</span>
                  <strong>Synchronization + stitching + calibration</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="litho-panel">
          <div className="litho-panel-inner">
            <div className="litho-kicker">Landscape</div>
            <h2>Three paths for lithography</h2>
            <p className="litho-section-copy">
              This concept is not framed as a replacement for every existing
              tool. It is a different architectural path.
            </p>

            <div className="industry-map-wrap">
              <div className="industry-y-axis">Programmable patterning</div>
              <div className="industry-map">
                <div className="axis-x" />
                <div className="axis-y" />

                <div className="map-node euv">
                  <strong>EUV scanners</strong>
                  <span>Monolithic machines</span>
                </div>

                <div className="map-node nil">
                  <strong>Nanoimprint</strong>
                  <span>Replication path</span>
                </div>

                <div className="map-node directwrite">
                  <strong>Maskless direct write</strong>
                  <span>Flexible, limited parallelism</span>
                </div>

                <div className="map-node distributed">
                  <strong>Distributed semiconductor lithography</strong>
                  <span>Tiled programmable modules</span>
                </div>

                <div className="x-axis-label">
                  Monolithic machine → distributed semiconductor architecture
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="litho-panel">
          <div className="litho-panel-inner">
            <div className="litho-kicker">Scaling</div>
            <h2>Lithography scaling paths</h2>

            <div className="scaling-slide">
              <div className="scaling-column">
                <div className="scaling-heading">Monolithic lithography systems</div>
                <div className="machine-block" />
                <div className="scaling-chain">
                  <span>Higher resolution</span>
                  <span>↓</span>
                  <span>More optical complexity</span>
                  <span>↓</span>
                  <span>Larger machines</span>
                </div>
                <div className="scaling-caption">
                  Scaling through optical complexity
                </div>
              </div>

              <div className="scaling-column">
                <div className="scaling-heading">
                  Distributed lithography architecture
                </div>
                <div className="module-grid">
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
                <div className="scaling-caption">
                  Scaling through semiconductor integration
                </div>
              </div>
            </div>

            <div className="scaling-footer">
              Architecture determines how technologies scale.
            </div>
          </div>
        </section>

        <section className="litho-panel litho-closing">
          <div className="litho-panel-inner">
            <div className="litho-kicker">Thesis</div>
            <h2>
              Lithography may eventually scale not through larger machines, but
              through semiconductor-manufacturable exposure architectures.
            </h2>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

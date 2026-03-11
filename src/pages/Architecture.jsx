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
      </Section>

      <Section eyebrow="Scaling" title="Architecture determines how lithography scales." className="scaling">
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
            <div className="scaling-note">Scaling through optical complexity</div>
          </div>
          <div className="scaling-side">
            <div className="scaling-side-title">Distributed lithography architecture</div>
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
            <div className="scaling-note">Scaling through semiconductor integration</div>
          </div>
        </div>
      </Section>

      <section className="final-thesis">
        <div className="final-thesis-inner">
          <div className="litho-eyebrow">Thesis</div>
          <h2>
            Lithography may eventually scale not through larger optical machines, 
            but through semiconductor-manufacturable exposure modules.
          </h2>
        </div>
      </section>

      <section style={{ marginTop: "60px" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
          Architecture Thinking Beyond Software
        </h2>
        <p style={{ maxWidth: "900px", lineHeight: "1.7" }}>
          Architectural reasoning applies not only to software systems but also to physical systems. 
          One current exploration considers whether lithography systems could scale through modular 
          exposure architectures rather than only through increasingly large optical machines.
        </p>
        <a href="/lithography" className="primary-button">
          Explore Modular Lithography →
        </a>
      </section>
    </main>
  </PageShell>
);
}

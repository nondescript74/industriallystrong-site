import { sendTelemetry } from "../utils/telemetry";

export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #1e293b",
        marginTop: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "28px 32px 40px 32px",
          opacity: 0.72,
          fontSize: "14px",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: 600 }}>
          IndustriallyStrong
        </div>
        <div>
          Systems, research architectures, and technical platform development.
        </div>
        <div style={{ marginTop: "8px" }}>
          This is systems architecture work — not feature development. The
          goal is proving what holds under adversarial conditions.
        </div>
        <div
          style={{
            marginTop: "16px",
            fontSize: "11px",
            opacity: 0.35,
            letterSpacing: "0.04em",
          }}
        >
          <a
            href="https://z.industriallystrong.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              borderBottom: "1px dotted currentColor",
              paddingBottom: "1px",
              transition: "opacity 0.3s",
            }}
            onClick={() =>
              sendTelemetry({
                app: "industriallystrong",
                lane: window.location.pathname === "/correctness" ? "storage" : "general",
                eventType: "outbound_click",
                metadata: {
                  label: "about_the_builder",
                  href: "https://z.industriallystrong.com",
                  section: "site_footer",
                },
              })
            }
            onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "inherit")}
          >
            About the builder
          </a>
        </div>
      </div>
    </footer>
  );
}

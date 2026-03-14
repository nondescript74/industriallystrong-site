import { Link } from "react-router-dom";
import { trackEvent } from "../utils/analytics";

export default function SiteHeader() {
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    opacity: 0.85,
    transition: "opacity 0.15s ease",
  };

  const handleEnter = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleLeave = (e) => {
    e.currentTarget.style.opacity = "0.85";
  };

  return (
    <header
      style={{
        borderBottom: "1px solid #1e293b",
        background: "#0b1320",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
            letterSpacing: "0.02em",
            fontSize: "16px",
          }}
        >
          IndustriallyStrong
        </Link>

        <nav
          style={{
            display: "flex",
            gap: "22px",
            flexWrap: "wrap",
            fontSize: "15px",
            alignItems: "center"
          }}
        >
          <Link to="/" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Home
          </Link>

          <Link to="/architecture" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Architecture
          </Link>

          <Link to="/concepts" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Concepts
          </Link>

          <Link to="/systems" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Systems
          </Link>

          <Link to="/decks" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Decks
          </Link>

          <Link to="/research" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Research
          </Link>

          <Link to="/programs" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Programs
          </Link>

          <Link to="/lab" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Lab
          </Link>

          <Link to="/about" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            About
          </Link>

          <Link to="/contact" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Contact
          </Link>

          <a
            href="https://www.linkedin.com/in/zahirudeen-premji-5a7a553b1/"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={() => trackEvent("external", "linkedin_profile")}
          >
            LinkedIn
          </a>
        </nav>
      </div>
    </header>
  );
}

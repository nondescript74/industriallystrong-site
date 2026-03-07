import { Link } from "react-router-dom";

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
          }}
        >
          <Link to="/" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Home
          </Link>

          <Link to="/concepts" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Concepts
          </Link>

          <Link to="/systems" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Systems
          </Link>

          <Link to="/research" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Research
          </Link>

          <Link to="/about" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            About
          </Link>

          <Link to="/contact" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

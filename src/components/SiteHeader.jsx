import { Link } from "react-router-dom";

export default function SiteHeader() {
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    opacity: 0.9,
  };

  return (
    <header
      style={{
        borderBottom: "1px solid #1e293b",
        background: "#0b1320",
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
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/concepts" style={linkStyle}>Concepts</Link>
          <Link to="/systems" style={linkStyle}>Systems</Link>
          <Link to="/research" style={linkStyle}>Research</Link>
          <Link to="/about" style={linkStyle}>About</Link>
          <Route path="/contact" element={<Contact />} />
        </nav>
      </div>
    </header>
  );
}

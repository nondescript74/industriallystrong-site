import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Concepts from "./pages/Concepts";
import Systems from "./pages/Systems";
import Research from "./pages/Research";
import About from "./pages/About";

export default function App() {
  return (
    <div>
      <nav
        style={{
          padding: "18px 40px",
          background: "#0b1320",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          gap: "24px",
          fontSize: "16px",
        }}
      >
        <Link style={{ marginRight: 20 }} to="/">Home</Link>

        <Link style={{ marginRight: 20 }} to="/concepts">Concepts</Link>

        <Link style={{ marginRight: 20 }} to="/systems">Systems</Link>

        <Link style={{ marginRight: 20 }} to="/research">Research</Link>

        <Link style={{ marginRight: 20 }} to="/about">About</Link>
      </nav>

      <div style={{ padding: "40px" }}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/concepts" element={<Concepts />} />

          <Route path="/systems" element={<Systems />} />

          <Route path="/research" element={<Research />} />

          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

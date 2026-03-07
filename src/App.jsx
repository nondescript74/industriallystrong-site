import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Concepts from "./pages/Concepts";
import Systems from "./pages/Systems";
import Research from "./pages/Research";
import About from "./pages/About";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import QRLPhoenix from "./pages/QRLPhoenix";
import GutSense from "./pages/GutSense";

export default function App() {
  return (
    <div>
      <SiteHeader />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/systems" element={<Systems />} />
        <Route path="/research" element={<Research />} />
        <Route path="/about" element={<About />} />
        <Route path="/systems/qrlphoenix" element={<QRLPhoenix />} />
        <Route path="/systems/gutsense" element={<GutSense />} />
      </Routes>

      <SiteFooter />
    </div>
  );
}

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
import Contact from "./pages/Contact";
import Architecture from "./pages/Architecture";
import Decks from "./pages/Decks";
import Programs from "./pages/Programs";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackStatcounterPageView } from "./utils/statcounter";

export default function App() {

  const location = useLocation();

  useEffect(() => {
    trackStatcounterPageView();
  }, [location.pathname]);

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
        <Route path="/contact" element={<Contact />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/programs" element={<Programs />} />
      </Routes>

      <SiteFooter />
    </div>
  );
}

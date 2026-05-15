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
import Lithography from "./pages/Lithography";
import Lab from "./pages/Lab";
import CorrectnessArbitration from "./pages/CorrectnessArbitration";
// PM47.10.1 — Cognition showcase page (public, auth-free; hosts the
// banked PM47.9.2 production proof-pack with operator-curated captions).
import Cognition from "./pages/Cognition";
import TelemetryPageView from "./components/TelemetryPageView";

// External redirect component for /z
function ExternalRedirect({ to }) {
  useEffect(() => { window.location.href = to; }, [to]);
  return null;
}

export default function App() {

  const location = useLocation();

  useEffect(() => {
    trackStatcounterPageView();
  }, [location.pathname]);

  return (
    <div>
      <SiteHeader />
      <TelemetryPageView />

      <Routes>
        <Route path="/" element={<Home />} />
        {/* New leadership-first IA paths — render Home and scroll to the matching section */}
        <Route path="/leadership" element={<Home />} />
        <Route path="/operating-model" element={<Home />} />
        <Route path="/evidence" element={<Home />} />
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
        <Route path="/lithography" element={<Lithography />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/correctness" element={<CorrectnessArbitration />} />
        <Route path="/cognition" element={<Cognition />} />
        <Route path="/z" element={<ExternalRedirect to="https://z.industriallystrong.com" />} />
      </Routes>

      <SiteFooter />
    </div>
  );
}

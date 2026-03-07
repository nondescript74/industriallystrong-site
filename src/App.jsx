import "./index.css";

const ideas = [
  {
    title: "Program Concepts",
    text: "A portfolio of high-consequence technical concepts aimed at institutional execution rather than solo commercialization.",
  },
  {
    title: "DARPA-Class Framing",
    text: "Mission-first, problem-first, capability-oriented articulation of disruptive ideas that demand multidisciplinary execution.",
  },
  {
    title: "Fintech Infrastructure",
    text: "Systems concepts focused on resilient intelligence, decision support, and next-generation market infrastructure.",
  },
  {
    title: "Thought Leadership",
    text: "A visible professional identity that attracts the right technical, strategic, and institutional conversations.",
  },
];

const focusAreas = [
  "Adaptive technical architectures",
  "High-risk / high-payoff programs",
  "Semiconductor and photonics concepts",
  "AI resilience and transparency",
  "Fintech systems and market intelligence",
  "Program formation and strategic narrative",
];

import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Concepts from "./pages/Concepts"
import Systems from "./pages/Systems"
import Research from "./pages/Research"
import About from "./pages/About"

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/concepts" element={<Concepts />} />

      <Route path="/systems" element={<Systems />} />

      <Route path="/research" element={<Research />} />

      <Route path="/about" element={<About />} />

    </Routes>
  )
}

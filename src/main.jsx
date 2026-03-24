import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import './index.css'
import { createTelemetry } from './telemetry'

const telemetry = createTelemetry({
  endpoint: "/api/telemetry",
  site: "industriallystrong.com",
  debug: false,
  respectDNT: false,
  respectGPC: false,
  heartbeatEnabled: true,
  heartbeatIntervalMs: 30000,
  heartbeatMinVisibleMs: 15000,
});

telemetry.start();

// Console diagnostics: IS_TELEMETRY.getDiagnostics()
window.IS_TELEMETRY = telemetry;

export { telemetry };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

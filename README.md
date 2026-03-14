# industriallystrong.com

Public website for Industrially Strong / buildzmarter-ai. React + Vite SPA deployed on Cloudflare Pages.

## Architecture

The site has two main parts:

**React SPA** (`src/`) — the main website with pages for Lithography, Programs, Research, Architecture, GutSense, QRL Phoenix, and more. Routed via `react-router-dom`, built with Vite, deployed automatically by Cloudflare Pages on push to `main`.

**Static Lab Visualizer** (`public/lab/`) — pre-rendered interactive Plotly.js dashboards for the EUV lithography simulation platform. These are self-contained HTML files with embedded chart data, served as static assets alongside the SPA. No server required.

## Lab Pages

The lab visualizer at `industriallystrong.com/lab/` contains 6 interactive simulation pages:

- **Multi-Head Writer Array** (`multihead.html`) — tiled multi-head array with A/B/C architecture selector, per-tile exposure calculator, stitching zones, and dose calibration. Default landing page.
- **PSF Synthesis** (`psf-synthesis.html`) — spatiotemporal exposure compositing demonstrating Claim 4 patent evidence. Incoherent/coherent compositing, coupled vs. sequential optimization, thermal relaxation, coherent sharpening.
- **2D Process Simulation** (`2d-process.html`) — full lithography pipeline: aerial image, acid generation, PEB diffusion, Mack dissolution model. Interactive heatmaps.
- **3D Optical Pipeline** (`3d-pipeline.html`) — beam path from VCSEL source through HHG gas cell to wafer. Gas supply, pressures, power budget, harmonic generation physics.
- **Fleet Economics** (`fleet-economics.html`) — sensitivity analysis across EUV power levels. ASML comparison, fleet sizing, CAPEX modeling.
- **Phoenix Engine State** (`phoenix-state.html`) — adaptive dose correction system status in JSON format.

Lab pages are generated from the `Laser-hhg-euv-lab` backend via FastAPI TestClient, then post-processed with BeautifulSoup to self-host Plotly.js and add deferred rendering for Cloudflare compatibility. The `plotly.min.js` (v3.4.0, ~4.7MB) is bundled locally to avoid CDN reliability issues.

## Development

```bash
npm install
npm run dev        # local dev server at localhost:5173
npm run build      # production build to dist/
```

## Deployment

Cloudflare Pages auto-deploys on push to `main`. The `_redirects` file in `public/` handles routing for static lab pages and presentation decks.

## Project Structure

```
src/
  App.jsx              # Router with all page routes
  pages/               # React page components
    Home.jsx, Lithography.jsx, Lab.jsx, Programs.jsx,
    Architecture.jsx, Research.jsx, About.jsx, ...
  components/          # Shared UI components
    SiteHeader.jsx, SiteFooter.jsx, CardLink.jsx,
    LiveMetricsCard.jsx, MHTDeck.jsx, ...
public/
  lab/                 # Static Plotly visualization pages
    plotly.min.js      # Self-hosted Plotly.js v3.4.0
    multihead.html, psf-synthesis.html, 2d-process.html,
    3d-pipeline.html, fleet-economics.html, phoenix-state.html,
    index.html         # Redirects to multihead.html
  decks/               # Static presentation files
  _redirects           # Cloudflare Pages routing rules
```

## Related Repos

- [`Laser-hhg-euv-lab`](https://github.com/nondescript74/Laser-hhg-euv-lab) — FastAPI backend with physics engines, simulation models, and visualization generators that produce the static lab HTML files.

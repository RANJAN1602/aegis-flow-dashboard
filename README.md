# ⚡ Aegis Flow — Real-Time Fraud Detection Dashboard

A production-ready, enterprise-grade **Fintech Fraud Detection Dashboard** built with React 18, Tailwind CSS, and Lucide React. Designed to look and feel like **Stripe Radar** or **Datadog** — dark, technical, and alive.

![Aegis Flow Dashboard](https://img.shields.io/badge/Stack-React%2018%20%7C%20Tailwind%20CSS%20%7C%20Lucide-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-f1f5f9?style=for-the-badge)

---

## 📸 Preview

```
┌──────────────────────────────────────────────────────────────────┐
│  AEGIS   STREAM CONSOLE // PRODUCTION ENVIRONMENT     ● LIVE     │
│  //FLOW  ─────────────────────────────────────────────────────── │
│  [■]     ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│  [ ]     │ 1,248,392   │ │ 42 ●        │ │ 14ms            │    │
│  [ ]     │ Total Events│ │ Fraud Flags │ │ Pipeline Latency│    │
│  [ ]     └─────────────┘ └─────────────┘ └─────────────────┘    │
│  [ ]     ┌──────────────────────────┐ ┌──────────────────┐      │
│          │ Transaction Velocity     │ │ Anomaly Scatter  │      │
│          │  ╭──╮   ╭─╮             │ │  · · ·  ●        │      │
│          │ ╭╯  ╰───╯ ╰──           │ │  · · · ·         │      │
│          └──────────────────────────┘ │    ●    · ·  ●   │      │
│          ┌────────────────────────────┴──────────────────┘      │
│          │ TXN-A1B2-C3D4  $149.99  UID-F2A1B3  ████░  APPROVED  │
│          │ TXN-X9Y8-Z7W6  $47,200  UID-9C3D1E  █████  ⚡FLAGGED  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **Live Transaction Stream** — auto-updates every 1.5s, newest events appear at the top with a smooth slide-in animation
- **Real-Time Metric Cards** — Total Ingested Events, Active Fraud Flags (with pulsing alert dot), and Pipeline Latency
- **Transaction Velocity Chart** — smooth SVG cubic Bézier sparkline with a 40-point rolling buffer
- **Anomaly Scatter Plot** — dense green cluster (normal) vs. 3 glowing red outliers (fraud) rendered in pure SVG
- **Risk Score Bars** — per-row progress bar colored green → amber → red by risk threshold
- **Status Badges** — `APPROVED` in emerald or `⚡ CRITICAL FLAGGED` in red with a pulsing glow animation
- **Live Uptime Counter** — real-time HH:MM:SS counter in the header
- **Dark Theme** — Zinc-950 / Slate-900 backgrounds, Inter + JetBrains Mono typography

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/RANJAN1602/aegis-flow-dashboard.git
cd aegis-flow-dashboard

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
aegis-flow-dashboard/
├── src/
│   ├── AegisDashboard.jsx   ← Entire dashboard (single component file)
│   ├── main.jsx             ← React 18 entry point
│   └── index.css            ← Tailwind directives + custom scrollbar
├── index.html               ← HTML shell + Google Fonts
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

---

## 🧩 Component Architecture

| Component | Description |
|---|---|
| `AegisDashboard` | Root component — owns all state, `useEffect` hooks, and tick loop |
| `Sidebar` | 56px fixed nav with `AEGIS // FLOW` brand and icon tabs |
| `Header` | Top bar with environment label, uptime clock, profile chip |
| `MetricCard` | Reusable stat card with colored accent line and badge |
| `VelocityChart` | Pure SVG sparkline with 40-point rolling buffer |
| `ScatterPlot` | Static SVG anomaly scatter (cluster + outliers) |
| `TxRow` | Single transaction row with risk bar and status badge |
| `RiskBar` | Green → Amber → Red progress bar keyed to risk score |
| `StatusBadge` | `APPROVED` or `CRITICAL FLAGGED` with glow animation |

---

## ⚙️ Simulation Logic

Every **1.5 seconds**, the dashboard:

1. Generates a new transaction via `genTx()` — 12% chance of fraud
2. Fraud transactions get `risk: 72–99`, amounts `$4,200–$49,000`, odd hours
3. Normal transactions get `risk: 3–38`, amounts `$12–$1,800`
4. Prepends the new row and drops the oldest (rolling 12-row window)
5. Pushes a new velocity value (60–285 ev/s) to the chart buffer
6. Increments `totalIngested` by 180–420 events

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#09090b` zinc-950 | Page root |
| Surface | `#0f172a` slate-900 | Cards, panels |
| Border | `#1e293b` slate-800 | All borders |
| Accent Blue | `#6366f1` indigo-500 | Active nav, chart line, TX IDs |
| Accent Green | `#10b981` emerald-500 | Approved status, normal data |
| Accent Red | `#ef4444` red-500 | Fraud flags, anomaly points |
| Display font | Inter | All UI text |
| Monospace font | JetBrains Mono | IDs, values, labels, counters |

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM renderer |
| `lucide-react` | ^0.383.0 | Icon set |
| `tailwindcss` | ^3.4.4 | Utility-first CSS |
| `vite` | ^5.3.1 | Dev server & bundler |

No charting library required — velocity chart is hand-rolled SVG for zero overhead.

---

## 🔌 Connecting to a Real Backend

To connect to the **FastAPI fraud detection backend** (the companion project):

```js
// Replace the setInterval tick in AegisDashboard.jsx with:
useEffect(() => {
  const id = setInterval(async () => {
    const res = await fetch('http://localhost:8000/api/v1/metrics');
    const data = await res.json();
    setRows(data.transactions.slice(0, MAX_ROWS));
    setTotalIngested(data.total_streamed);
    setFlags(data.total_flagged);
    setLatency(data.avg_latency_ms);
  }, 1500);
  return () => clearInterval(id);
}, []);
```

---

## 📄 License

MIT © 2025 — free to use, modify, and distribute.

---

<div align="center">
  Built with React · Tailwind CSS · Lucide React · Vite
</div>

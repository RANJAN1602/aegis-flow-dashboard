/**
 * AegisDashboard.jsx
 * Fintech Real-Time Fraud Detection Dashboard
 * Stack: React 18 · Tailwind CSS · Lucide React
 *
 * Usage:
 *   import AegisDashboard from './AegisDashboard';
 *   <AegisDashboard />
 *
 * Peer deps: react, react-dom, tailwindcss, lucide-react
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Database,
  LayoutDashboard,
  ScrollText,
  Settings,
  Settings2,
  TrendingUp,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  Constants & Utilities
// ─────────────────────────────────────────────────────────────
const MAX_ROWS = 12;
const MAX_CHART_PTS = 40;
const TICK_MS = 1500;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max));
}
function randHex(n) {
  return Array.from({ length: n }, () =>
    "0123456789ABCDEF"[randInt(0, 16)]
  ).join("");
}
function fmtNum(n) {
  return n.toLocaleString("en-US");
}
function fmtUSD(v) {
  return parseFloat(v).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}
function fmtUptime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}

function riskColor(r) {
  if (r < 35) return { bar: "#10b981", text: "text-emerald-400" };
  if (r < 65) return { bar: "#f59e0b", text: "text-amber-400" };
  return { bar: "#ef4444", text: "text-red-400" };
}

function genTx() {
  const isFraud = Math.random() < 0.12;
  const risk = isFraud ? randInt(72, 99) : randInt(3, 38);
  const amount = isFraud ? rand(4200, 49000) : rand(12, 1800);
  return {
    id: `TXN-${randHex(4)}-${randHex(4)}`,
    amount: amount.toFixed(2),
    user: `UID-${randHex(6)}`,
    risk,
    fraud: isFraud,
    key: `${Date.now()}-${Math.random()}`,
  };
}

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

/** Left sidebar navigation */
function Sidebar() {
  const navItems = [
    { icon: <LayoutDashboard size={17} />, label: "Dashboard", active: true },
    { icon: <Settings2 size={17} />, label: "Rules Engine" },
    { icon: <Brain size={17} />, label: "ML Models" },
    { icon: <ScrollText size={17} />, label: "Live Logs" },
  ];

  return (
    <aside className="w-14 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-1.5">
      {/* Brand */}
      <div className="w-full text-center pb-3 mb-2 border-b border-slate-800">
        <span className="font-mono text-[8px] font-bold text-indigo-400 leading-tight block">
          AEGIS
        </span>
        <span className="font-mono text-[7px] text-slate-600 leading-tight block">
          // FLOW
        </span>
      </div>

      {/* Nav */}
      {navItems.map(({ icon, label, active }) => (
        <button
          key={label}
          title={label}
          aria-label={label}
          className={`
            relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors
            ${active
              ? "bg-indigo-950 text-indigo-400"
              : "text-slate-600 hover:bg-slate-800 hover:text-slate-400"
            }
          `}
        >
          {active && (
            <span className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r" />
          )}
          {icon}
        </button>
      ))}

      <div className="flex-1" />
      <button
        title="Settings"
        aria-label="Settings"
        className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-800 hover:text-slate-400 transition-colors"
      >
        <Settings size={17} />
      </button>
    </aside>
  );
}

/** Top header bar */
function Header({ uptime }) {
  return (
    <header className="h-12 shrink-0 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] font-medium text-slate-300 tracking-wide">
          STREAM CONSOLE // PRODUCTION ENVIRONMENT
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
          LIVE
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Uptime: <span className="text-slate-400">{uptime}</span>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-1 text-slate-400 text-[11px] hover:bg-slate-700 transition-colors">
          <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[8px] font-bold text-indigo-400">
            AJ
          </span>
          A. Jensen
          <ChevronDown size={12} />
        </button>
      </div>
    </header>
  );
}

/** Metric card */
function MetricCard({ label, value, badge, badgeVariant, icon, accentClass }) {
  const variants = {
    up: "bg-emerald-950 text-emerald-400 border-emerald-900",
    alert: "bg-red-950 text-red-400 border-red-900",
    ok: "bg-emerald-950 text-emerald-400 border-emerald-900",
  };

  return (
    <div
      className={`relative bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden`}
    >
      {/* Top accent line */}
      <span
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px ${accentClass}`}
      />

      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
        {icon}
        {label}
      </div>
      <div className="font-mono text-2xl font-bold text-slate-100 tracking-tight">
        {value}
      </div>
      {badge && (
        <div
          className={`inline-flex items-center gap-1.5 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded border ${variants[badgeVariant]}`}
        >
          {badgeVariant === "up" && <TrendingUp size={10} />}
          {badgeVariant === "alert" && <AlertTriangle size={10} />}
          {badgeVariant === "ok" && <Check size={10} />}
          {badge}
        </div>
      )}
      {label === "Active Fraud Flags" && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  );
}

/** SVG velocity chart */
function VelocityChart({ data }) {
  const W = 480, H = 130, PAD = 18, TOP = 22;
  const MAX_V = 300;

  function px(i) {
    return PAD + (i / (MAX_CHART_PTS - 1)) * (W - PAD * 2);
  }
  function py(v) {
    return TOP + (1 - v / MAX_V) * (H - TOP - 8);
  }

  const pts = data.slice(-MAX_CHART_PTS);
  const n = pts.length;

  let linePath = "";
  let fillPath = "";

  if (n >= 2) {
    linePath = `M ${px(0)} ${py(pts[0])}`;
    for (let i = 1; i < n; i++) {
      const cpx = (px(i - 1) + px(i)) / 2;
      linePath += ` C ${cpx} ${py(pts[i - 1])}, ${cpx} ${py(pts[i])}, ${px(i)} ${py(pts[i])}`;
    }
    fillPath = linePath + ` L ${px(n - 1)} ${H} L ${px(0)} ${H} Z`;
  }

  const latest = pts[n - 1] ?? 0;
  const lx = n >= 2 ? px(n - 1) : PAD;
  const ly = py(latest);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: 130 }}
      role="img"
      aria-label="Line chart of transaction velocity in events per second over the last 40 ticks"
    >
      <defs>
        <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[25, 65, 105].map((y) => (
        <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#1e293b" strokeWidth={1} />
      ))}
      {["300", "150", "0"].map((label, i) => (
        <text
          key={label}
          x={2}
          y={[23, 63, 103][i]}
          fontSize={8}
          fill="#334155"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      ))}
      {/* Fill */}
      {fillPath && <path d={fillPath} fill="url(#velGrad)" />}
      {/* Line */}
      {linePath && (
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2} />
      )}
      {/* Latest dot */}
      {n >= 2 && <circle cx={lx} cy={ly} r={3} fill="#818cf8" />}
    </svg>
  );
}

/** Anomaly scatter plot */
function ScatterPlot() {
  const normals = [
    [85,78],[92,72],[78,82],[98,80],[88,68],[76,74],[102,74],[81,88],
    [94,85],[90,92],[74,68],[108,78],[83,62],[97,66],[72,80],[104,85],
    [86,94],[79,58],[111,71],[69,86],[100,90],[87,76],[91,84],[95,60],
    [82,96],[106,68],[77,90],[93,55],[113,82],[68,75],
  ];
  const frauds = [[168, 22], [32, 112], [190, 105]];

  return (
    <svg
      viewBox="0 0 210 140"
      className="w-full"
      style={{ height: 140 }}
      role="img"
      aria-label="Scatter plot: dense green cluster of normal transactions with three red outlier anomaly points"
    >
      <line x1={10} y1={5} x2={10} y2={130} stroke="#1e293b" strokeWidth={1} />
      <line x1={10} y1={130} x2={205} y2={130} stroke="#1e293b" strokeWidth={1} />

      {/* Normal cluster */}
      {normals.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2} fill="#10b981" opacity={0.7} />
      ))}

      {/* Fraud outliers */}
      {frauds.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={9} fill="none" stroke="#ef4444" strokeWidth={0.5} opacity={0.2} />
          <circle cx={cx} cy={cy} r={6} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} opacity={0.9} />
          <circle cx={cx} cy={cy} r={3.5} fill="#ef4444" opacity={0.9} />
        </g>
      ))}

      {/* Axis labels */}
      <text x={62} y={139} fontSize={7} fill="#334155" fontFamily="JetBrains Mono, monospace">
        FEATURE A →
      </text>
      <text
        x={13}
        y={70}
        fontSize={7}
        fill="#334155"
        fontFamily="JetBrains Mono, monospace"
        writingMode="vertical-lr"
        transform="rotate(180,13,70)"
        textAnchor="middle"
      >
        FTR B
      </text>
      <text x={140} y={18} fontSize={7} fill="#ef4444" fontFamily="JetBrains Mono, monospace">
        ANOMALY
      </text>
      <text x={64} y={79} fontSize={7} fill="#10b981" fontFamily="JetBrains Mono, monospace">
        CLUSTER
      </text>
    </svg>
  );
}

/** Risk score progress bar cell */
function RiskBar({ risk }) {
  const { bar, text } = riskColor(risk);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(3, risk)}%`, background: bar }}
        />
      </div>
      <span
        className={`font-mono text-[10px] font-semibold min-w-[26px] text-right ${text}`}
      >
        {risk}
      </span>
    </div>
  );
}

/** Status badge */
function StatusBadge({ fraud }) {
  if (fraud) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded
                   bg-red-950 text-red-400 border border-red-900"
        style={{ animation: "flagGlow 1.5s ease-in-out infinite" }}
      >
        <Zap size={9} />
        CRITICAL FLAGGED
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded
                 bg-emerald-950 text-emerald-400 border border-emerald-900"
    >
      <Check size={9} />
      APPROVED
    </span>
  );
}

/** Transaction row */
function TxRow({ tx, isNew }) {
  return (
    <div
      className={`
        grid items-center px-4 py-2 border-b border-slate-900
        hover:bg-slate-800/40 transition-colors
        ${isNew ? "animate-[rowIn_0.35s_ease]" : ""}
      `}
      style={{
        gridTemplateColumns: "170px 100px 140px 160px 140px",
      }}
    >
      <span className="font-mono text-[11px] text-indigo-400 truncate">{tx.id}</span>
      <span className="font-mono text-[12px] text-slate-200 font-medium">{fmtUSD(tx.amount)}</span>
      <span className="text-[11px] text-slate-500 truncate">{tx.user}</span>
      <RiskBar risk={tx.risk} />
      <StatusBadge fraud={tx.fraud} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Dashboard
// ─────────────────────────────────────────────────────────────
export default function AegisDashboard() {
  const [totalIngested, setTotalIngested] = useState(1_248_392);
  const [flags, setFlags] = useState(42);
  const [latency, setLatency] = useState(14);
  const [streamCount, setStreamCount] = useState(0);
  const [rows, setRows] = useState(() => {
    return Array.from({ length: 8 }, () => ({ ...genTx(), isNew: false }));
  });
  const [chartData, setChartData] = useState(() =>
    Array.from({ length: 20 }, () => randInt(60, 280))
  );
  const [uptimeSecs, setUptimeSecs] = useState(15157);
  const newKeyRef = useRef(null);

  // Uptime clock
  useEffect(() => {
    const id = setInterval(() => setUptimeSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Main streaming tick
  const tick = useCallback(() => {
    const tx = genTx();
    newKeyRef.current = tx.key;

    setRows((prev) => {
      const next = [{ ...tx, isNew: true }, ...prev.map((r) => ({ ...r, isNew: false }))];
      return next.slice(0, MAX_ROWS);
    });

    setChartData((prev) => {
      const next = [...prev, randInt(60, 285)];
      return next.slice(-MAX_CHART_PTS);
    });

    setTotalIngested((n) => n + randInt(180, 420));
    setStreamCount((n) => n + 1);
    setLatency(randInt(10, 22));
    if (tx.fraud) setFlags((f) => f + 1);
  }, []);

  useEffect(() => {
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  const velocityVal =
    chartData.length > 0 ? chartData[chartData.length - 1] : 0;

  return (
    <>
      {/* Inject keyframes that can't be expressed in Tailwind */}
      <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(-8px); background-color: #1e1b4b; }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flagGlow {
          0%, 100% { box-shadow: none; }
          50%       { box-shadow: 0 0 8px rgba(239,68,68,0.45); }
        }
        .aegis-font { font-family: 'Inter', system-ui, sans-serif; }
        .aegis-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
      `}</style>

      <div className="aegis-font bg-zinc-950 text-slate-100 flex h-screen overflow-hidden">
        <Sidebar />

        {/* Main column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header uptime={fmtUptime(uptimeSecs)} />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Metric Cards */}
            <section className="grid grid-cols-3 gap-3" aria-label="Key metrics">
              <MetricCard
                label="Total Ingested Events"
                value={fmtNum(totalIngested)}
                badge="+12.4% / hr"
                badgeVariant="up"
                accentClass="bg-indigo-500"
                icon={<Database size={12} />}
              />
              <MetricCard
                label="Active Fraud Flags"
                value={String(flags)}
                badge="Requires Review"
                badgeVariant="alert"
                accentClass="bg-red-500"
                icon={<AlertTriangle size={12} />}
              />
              <MetricCard
                label="Pipeline Latency"
                value={`${latency}ms`}
                badge="Optimal Engine Load"
                badgeVariant="ok"
                accentClass="bg-emerald-500"
                icon={<Clock size={12} />}
              />
            </section>

            {/* Charts row */}
            <section className="grid gap-3" style={{ gridTemplateColumns: "65fr 35fr" }}>

              {/* Velocity Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    <Activity size={13} />
                    Transaction Velocity
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">
                    {velocityVal} ev/s
                  </span>
                </div>
                <VelocityChart data={chartData} />
              </div>

              {/* Scatter */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    Anomaly Scatter
                  </span>
                  <span className="font-mono text-[10px] text-slate-600">IsoForest · 2D</span>
                </div>
                <ScatterPlot />
              </div>

            </section>

            {/* Event stream table */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  <ScrollText size={13} />
                  Real-Time Event Stream
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {fmtNum(streamCount)} events / stream
                </div>
              </div>

              {/* Column labels */}
              <div
                className="grid px-4 py-2 border-b border-slate-800"
                style={{ gridTemplateColumns: "170px 100px 140px 160px 140px" }}
              >
                {["Transaction ID", "Amount", "User ID", "Risk Score", "Status"].map((col) => (
                  <span
                    key={col}
                    className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest"
                  >
                    {col}
                  </span>
                ))}
              </div>

              {/* Rows */}
              <div className="overflow-hidden" style={{ maxHeight: 280 }}>
                {rows.map((tx) => (
                  <TxRow key={tx.key} tx={tx} isNew={tx.isNew} />
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  );
}

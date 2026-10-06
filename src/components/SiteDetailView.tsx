"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, Zap, Code2, Users, Eye, ArrowLeft, Calendar } from "lucide-react";
import { SiteStats } from "@/lib/types";

interface SiteDetailViewProps {
  stats: SiteStats;
  onBack: () => void;
  onOpenSnippet: () => void;
}

export function SiteDetailView({ stats, onBack, onOpenSnippet }: SiteDetailViewProps) {
  const { site, health, timeseries, topPages, topReferrers, devices, browsers, customEvents } = stats;
  const [exporting, setExporting] = useState(false);

  const handleDownloadCsv = () => {
    setExporting(true);
    window.location.href = `/api/export?site=${site.id}`;
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1c2a3d]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] text-xs font-mono text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Radar
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{site.name}</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                  health.ok
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {health.ok ? "ONLINE" : "DEGRADED"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                {site.url} ↗
              </a>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                Deployed: {site.deployedDate} ({stats.daysDeployed} days ago)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] text-slate-200 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenSnippet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Get Embed Code</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 24h & Lifetime Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live Active</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums flex items-baseline gap-1">
            {stats.liveVisitors}
            <span className="text-[9px] text-emerald-500/80 font-normal">now</span>
          </div>
        </div>

        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">24h Views</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {stats.pageviews24h.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">24h Viewers</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {stats.visitors24h.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0f1622] border border-cyan-500/20 bg-cyan-950/10 rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Total Views (Since Deployment)</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
            {(stats.allTimePageviews || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0f1622] border border-cyan-500/20 bg-cyan-950/10 rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Total Viewers (Since Deployment)</div>
          <div className="text-xl font-bold font-mono text-cyan-200 mt-1 tabular-nums">
            {(stats.allTimeVisitors || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Edge Latency</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {health.latencyMs}ms
          </div>
        </div>
      </div>

      {/* Chart: 24h Hourly Traffic Curve */}
      <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">24-Hour Traffic Curve</h3>
            <p className="text-[11px] font-mono text-slate-400">Pageviews (cyan) vs Unique Viewers (emerald)</p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">Live UTC Stream</div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b0f14",
                  border: "1px solid #1c2a3d",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Area type="monotone" dataKey="views" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" name="Views" />
              <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#visitorsGrad)" name="Visitors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Grid: Top Pages & Top Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3">Top Pages</h3>
          <div className="space-y-2">
            {topPages.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2a3d]/50">
                <span className="font-mono text-slate-300 truncate max-w-[240px]">{p.path}</span>
                <span className="font-mono font-medium text-cyan-400 tabular-nums">{p.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3">Top Referrers</h3>
          <div className="space-y-2">
            {topReferrers.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2a3d]/50">
                <span className="font-mono text-slate-300 truncate max-w-[240px]">{r.source}</span>
                <span className="font-mono font-medium text-emerald-400 tabular-nums">{r.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device, Browser & Custom Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3">Device Types</h3>
          <div className="space-y-2">
            {devices.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{d.name}</span>
                  <span className="text-slate-400 tabular-nums">{d.pct}% ({d.count})</span>
                </div>
                <div className="h-1.5 w-full bg-[#080c12] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3">Browsers</h3>
          <div className="space-y-2">
            {browsers.map((b, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{b.name}</span>
                  <span className="text-slate-400 tabular-nums">{b.pct}% ({b.count})</span>
                </div>
                <div className="h-1.5 w-full bg-[#080c12] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Tracked Actions */}
        <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3">Custom Events</h3>
          <div className="space-y-2">
            {customEvents.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono space-y-1">
                <p>No custom events logged yet.</p>
                <p className="text-[10px] text-slate-600">Call `window.pulse.track(&apos;name&apos;)` anywhere to log conversions.</p>
              </div>
            ) : (
              customEvents.map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2a3d]/50">
                  <span className="font-mono text-cyan-300 truncate">{ev.name}</span>
                  <span className="font-mono font-bold text-white tabular-nums">{ev.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

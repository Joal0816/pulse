"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  Radio,
  Server,
  Zap,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Users,
  Smartphone,
} from "lucide-react";
import { SiteStats, MonitoredSite } from "@/lib/types";
import { SnippetModal } from "@/components/SnippetModal";
import { SiteDetailView } from "@/components/SiteDetailView";

export default function Dashboard() {
  const [data, setData] = useState<{
    sites: SiteStats[];
    totalPageviews24h: number;
    totalVisitors24h: number;
    liveVisitorsNow: number;
    networkUptimeAvg: number;
    avgLatencyMs: number;
    systemLastChecked: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [modalSite, setModalSite] = useState<MonitoredSite | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      const res = await fetch(`/api/stats${force ? "?force=true" : ""}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
    // Polling interval every 15 seconds for real-time live pulse
    const interval = setInterval(() => {
      fetchStats(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const openSnippetFor = (site?: MonitoredSite) => {
    setModalSite(site);
    setIsModalOpen(true);
  };

  const selectedStats = data?.sites.find((s) => s.site.id === selectedSiteId);

  return (
    <div className="min-h-screen bg-[#080c12] text-slate-100 font-sans selection:bg-cyan-500/20">
      {/* Top Telemetry Header */}
      <header className="border-b border-[#1c2a3d] bg-[#0b0f14]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">PULSE</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#152030] border border-[#1c2a3d] text-cyan-400">
                  v1.0.0
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  joalvergs.tech
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Unified Telemetry & Web Analytics Radar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => openSnippetFor(undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] text-xs font-mono text-cyan-300 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Snippet</span>
            </button>
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] text-xs font-mono text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Probe Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Connecting to telemetry network...</p>
          </div>
        ) : selectedStats ? (
          /* Detailed Single-Site View */
          <SiteDetailView
            stats={selectedStats}
            onBack={() => setSelectedSiteId(null)}
            onOpenSnippet={() => openSnippetFor(selectedStats.site)}
          />
        ) : (
          /* Multi-Site Network Overview */
          <>
            {/* Global Stats Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">Live Visitors</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white tabular-nums">
                    {data?.liveVisitorsNow || 0}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    right now
                  </span>
                </div>
              </div>

              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">24h Network Views</span>
                  <Radio className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-cyan-400 tabular-nums">
                    {data?.totalPageviews24h?.toLocaleString() || 0}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ({data?.totalVisitors24h || 0} uniq)
                  </span>
                </div>
              </div>

              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">Avg Latency</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                    {data?.avgLatencyMs || 0}ms
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">edge ping</span>
                </div>
              </div>

              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider">Network Uptime</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white tabular-nums">
                    {data?.networkUptimeAvg || 100}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">7/7 nodes</span>
                </div>
              </div>
            </div>

            {/* Network Sites Radar Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    Monitored Deployments ({data?.sites.length || 0})
                  </h2>
                  <p className="text-[11px] font-mono text-slate-400">
                    Click any node for deep telemetry, timeseries analytics, and snippet integration.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Last probed: {data?.systemLastChecked ? new Date(data.systemLastChecked).toLocaleTimeString() : "Never"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.sites.map((st) => {
                  const isOk = st.health.ok;
                  return (
                    <div
                      key={st.site.id}
                      onClick={() => setSelectedSiteId(st.site.id)}
                      className="group bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] hover:border-cyan-500/40 rounded-xl p-5 cursor-pointer transition-all duration-200 relative overflow-hidden"
                    >
                      {/* Top Bar of Card */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isOk ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                              }`}
                            />
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {st.site.name}
                            </h3>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
                            {st.site.host}
                          </p>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080c12] border border-[#1c2a3d] text-slate-300">
                          {st.site.platform}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                        {st.site.description}
                      </p>

                      {/* Card Metric Chips */}
                      <div className="mt-4 pt-3 border-t border-[#1c2a3d]/70 grid grid-cols-3 gap-2 text-center font-mono text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">VIEWS</div>
                          <div className="font-bold text-cyan-400 tabular-nums">{st.pageviews24h}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">LATENCY</div>
                          <div className="font-bold text-emerald-400 tabular-nums">{st.health.latencyMs}ms</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">UPTIME</div>
                          <div className="font-bold text-white tabular-nums">{st.uptime24h}%</div>
                        </div>
                      </div>

                      {/* Hover Arrow Indicator */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Install Bar */}
            <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                    One-Line Tracking Script
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Ready to track real pageviews, referrers, and visitors across all 7 sites? Grab the unified snippet.
                </p>
              </div>

              <button
                onClick={() => openSnippetFor(undefined)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs font-mono transition-colors shadow-lg shadow-cyan-500/20 whitespace-nowrap"
              >
                View Universal Snippet
              </button>
            </div>
          </>
        )}
      </main>

      {/* Snippet Modal */}
      {isModalOpen && (
        <SnippetModal site={modalSite} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

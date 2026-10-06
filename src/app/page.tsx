"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  Zap,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Users,
  Eye,
  ArrowUpRight,
  Download,
  Bell,
} from "lucide-react";
import { SiteStats, MonitoredSite, NetworkSummary } from "@/lib/types";
import { SnippetModal } from "@/components/SnippetModal";
import { SiteDetailView } from "@/components/SiteDetailView";

export default function Dashboard() {
  const [data, setData] = useState<NetworkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [modalSite, setModalSite] = useState<MonitoredSite | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Webhook Configuration State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookSavedMsg, setWebhookSavedMsg] = useState("");

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
    // Real-time live polling interval every 12 seconds
    const interval = setInterval(() => {
      fetchStats(false);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const openSnippetFor = (site?: MonitoredSite) => {
    setModalSite(site);
    setIsModalOpen(true);
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return;
    setSavingWebhook(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, latencyThreshold: 2000 }),
      });
      if (res.ok) {
        setWebhookSavedMsg("Alert webhook saved! Test ping dispatched.");
        setTimeout(() => {
          setIsAlertModalOpen(false);
          setWebhookSavedMsg("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingWebhook(false);
    }
  };

  const selectedStats = data?.sites.find((s) => s.site.id === selectedSiteId);

  return (
    <div className="min-h-screen bg-[#080c12] text-slate-100 font-sans selection:bg-cyan-500/20">
      {/* Top Telemetry Header */}
      <header className="border-b border-[#1c2a3d] bg-[#0b0f14]/90 backdrop-blur sticky top-0 z-40">
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
                  v1.2.0
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  joalvergs.tech
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Unified Telemetry, Health & Lifetime Visitor Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] text-xs font-mono text-slate-300 transition-colors"
              title="Alert Channels"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Alerts</span>
            </button>
            <a
              href="/api/export"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1622] hover:bg-[#152030] border border-[#1c2a3d] text-xs font-mono text-slate-300 transition-colors"
              title="Download Raw Analytics"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </a>
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
            {/* Global Stats Grid: Live, 24h & Lifetime Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* 1. Live Active Visitors */}
              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Live Active</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {data?.liveVisitorsNow || 0}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    now
                  </span>
                </div>
              </div>

              {/* 2. 24h Pageviews */}
              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">24h Views</span>
                  <Radio className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                    {data?.totalPageviews24h?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">today</span>
                </div>
              </div>

              {/* 3. 24h Unique Viewers */}
              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">24h Viewers</span>
                  <Users className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {data?.totalVisitors24h?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">uniq</span>
                </div>
              </div>

              {/* 4. Total Views (Since Deployment) */}
              <div className="bg-[#0f1622] border border-cyan-500/20 bg-cyan-950/10 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Views</span>
                  <Eye className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                    {data?.allTimeTotalPageviews?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-500/80">lifetime</span>
                </div>
              </div>

              {/* 5. Total Viewers (Since Deployment) */}
              <div className="bg-[#0f1622] border border-cyan-500/20 bg-cyan-950/10 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Viewers</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-cyan-200 tabular-nums">
                    {data?.allTimeTotalVisitors?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-500/80">since launch</span>
                </div>
              </div>

              {/* 6. Network Health & Latency */}
              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Avg Latency</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {data?.avgLatencyMs || 0}ms
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {data?.networkUptimeAvg || 100}%
                  </span>
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
                    Lifetime viewers calculated from initial domain deployment records + live telemetry.
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
                                isOk
                                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                                  : "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
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

                      <div className="mt-2 text-[10px] font-mono text-slate-500">
                        Launch: {st.site.deployedDate} ({st.daysDeployed} days ago)
                      </div>

                      {/* Card Metric Chips: 24h & All-Time Dual Counters */}
                      <div className="mt-3 pt-3 border-t border-[#1c2a3d]/70 grid grid-cols-4 gap-2 text-center font-mono text-xs">
                        <div>
                          <div className="text-[9px] text-slate-400">LIVE</div>
                          <div className="font-bold text-emerald-400 tabular-nums">{st.liveVisitors}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400">24H VIEWS</div>
                          <div className="font-bold text-white tabular-nums">{st.pageviews24h}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-cyan-400">TOTAL VIEWERS</div>
                          <div className="font-bold text-cyan-300 tabular-nums">{st.allTimeVisitors.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400">LATENCY</div>
                          <div className="font-bold text-emerald-400 tabular-nums">{st.health.latencyMs}ms</div>
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

            {/* Live Incidents & Alert Stream */}
            {data?.recentAlerts && data.recentAlerts.length > 0 && (
              <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                      Recent Telemetry Events & Anomalies
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Last 24 Hours</span>
                </div>
                <div className="space-y-2">
                  {data.recentAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded bg-[#080c12] border border-[#1c2a3d] font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          alt.type === "outage" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {alt.type.toUpperCase()}
                        </span>
                        <span className="text-white font-semibold">{alt.site}:</span>
                        <span className="text-slate-300">{alt.message}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(alt.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Snippet Modal */}
      {isModalOpen && (
        <SnippetModal site={modalSite} onClose={() => setIsModalOpen(false)} />
      )}

      {/* Alert Webhook Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1c2a3d]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Configure Incident Webhook Alert
                </h3>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-[#152030] border border-[#1c2a3d]"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="py-4 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect a Discord, Slack, or Telegram webhook URL. Pulse will ping this webhook immediately if any of your 7 websites go down or edge latency spikes above threshold.
              </p>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Webhook URL (Discord / Slack / Custom)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://discord.com/api/webhooks/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-[#080c12] border border-[#1c2a3d] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {webhookSavedMsg && (
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{webhookSavedMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#152030] hover:bg-[#1c2a3d] text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWebhook}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {savingWebhook ? "Saving..." : "Save & Enable Alerts"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

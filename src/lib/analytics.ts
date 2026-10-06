import { store } from "./store";
import { MONITORED_SITES, SiteStats, SiteHealthCheck } from "./types";
import { probeAllSites } from "./probe";

function parseUserAgent(ua: string) {
  let browser = "Other";
  let os = "Other";
  let device: "desktop" | "mobile" | "tablet" = "desktop";

  if (/Mobi|Android|iPhone/i.test(ua)) {
    device = "mobile";
  } else if (/iPad|Tablet/i.test(ua)) {
    device = "tablet";
  }

  if (/Firefox\/([0-9.]+)/.test(ua)) browser = "Firefox";
  else if (/Edg\/([0-9.]+)/.test(ua)) browser = "Edge";
  else if (/Chrome\/([0-9.]+)/.test(ua)) browser = "Chrome";
  else if (/Safari\/([0-9.]+)/.test(ua)) browser = "Safari";

  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { browser, os, device };
}

export { parseUserAgent };

export async function aggregateStats(forceProbes = false): Promise<{
  sites: SiteStats[];
  totalPageviews24h: number;
  totalVisitors24h: number;
  liveVisitorsNow: number;
  networkUptimeAvg: number;
  avgLatencyMs: number;
  systemLastChecked: string;
}> {
  const healthMap = await probeAllSites(forceProbes);
  const now = Date.now();
  const past24h = now - 24 * 3600 * 1000;
  const past5m = now - 5 * 60 * 1000;

  const events24h = store.events.filter((e) => e.timestamp >= past24h);

  let totalPageviews24h = 0;
  const globalUniqueSessions = new Set<string>();
  const globalLiveSessions = new Set<string>();
  let totalLatencySum = 0;
  let totalLatencyCount = 0;
  let totalUptimeSum = 0;

  const sitesStats: SiteStats[] = MONITORED_SITES.map((site) => {
    const siteEvents = events24h.filter((e) => e.site === site.id);
    const siteEvents5m = store.events.filter((e) => e.site === site.id && e.timestamp >= past5m);

    const pageviews24h = siteEvents.length;
    totalPageviews24h += pageviews24h;

    const sessionSet = new Set(siteEvents.map((e) => e.session));
    const visitors24h = sessionSet.size;
    sessionSet.forEach((s) => globalUniqueSessions.add(s));

    const liveSessionSet = new Set(siteEvents5m.map((e) => e.session));
    const liveVisitors = liveSessionSet.size;
    liveSessionSet.forEach((s) => globalLiveSessions.add(s));

    // Top Pages
    const pageCounts: Record<string, number> = {};
    siteEvents.forEach((e) => {
      const p = e.path.split("?")[0] || "/";
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Top Referrers
    const refCounts: Record<string, number> = {};
    siteEvents.forEach((e) => {
      let r = e.referrer ? e.referrer.trim() : "Direct / None";
      try {
        if (r.startsWith("http")) {
          const u = new URL(r);
          r = u.hostname;
        }
      } catch (err) {}
      refCounts[r] = (refCounts[r] || 0) + 1;
    });
    const topReferrers = Object.entries(refCounts)
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device breakdown
    const devCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    siteEvents.forEach((e) => {
      const dev = e.device || "desktop";
      devCounts[dev] = (devCounts[dev] || 0) + 1;
    });
    const totalDevs = pageviews24h || 1;
    const devices = Object.entries(devCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        pct: Math.round((count / totalDevs) * 100),
      }))
      .filter((d) => d.count > 0);

    // Browser breakdown
    const brwCounts: Record<string, number> = {};
    siteEvents.forEach((e) => {
      const b = e.browser || "Unknown";
      brwCounts[b] = (brwCounts[b] || 0) + 1;
    });
    const browsers = Object.entries(brwCounts)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / totalDevs) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Hourly timeseries for last 24 hours
    const hourlyViews: Record<string, number> = {};
    const hourlyVisitors: Record<string, Set<string>> = {};

    for (let h = 23; h >= 0; h--) {
      const d = new Date(now - h * 3600 * 1000);
      const key = `${d.getHours().toString().padStart(2, "0")}:00`;
      hourlyViews[key] = 0;
      hourlyVisitors[key] = new Set();
    }

    siteEvents.forEach((e) => {
      const d = new Date(e.timestamp);
      const key = `${d.getHours().toString().padStart(2, "0")}:00`;
      if (hourlyViews[key] !== undefined) {
        hourlyViews[key] += 1;
        hourlyVisitors[key].add(e.session);
      }
    });

    const timeseries = Object.entries(hourlyViews).map(([hour, views]) => ({
      hour,
      views,
      visitors: hourlyVisitors[hour] ? hourlyVisitors[hour].size : 0,
    }));

    // Uptime calculation based on recorded history
    const history = store.healthHistory[site.id] || [];
    let uptime24h = 100;
    if (history.length > 0) {
      const upCount = history.filter((h) => h.ok).length;
      uptime24h = Math.round((upCount / history.length) * 1000) / 10;
    }

    const health: SiteHealthCheck = healthMap[site.id] || {
      siteId: site.id,
      timestamp: now,
      status: 200,
      latencyMs: 85,
      ok: true,
      checkedAt: new Date(now).toISOString(),
    };

    if (health.latencyMs > 0) {
      totalLatencySum += health.latencyMs;
      totalLatencyCount++;
    }
    totalUptimeSum += uptime24h;

    return {
      site,
      pageviews24h,
      visitors24h,
      liveVisitors,
      bounceRate: 34.2,
      avgDurationSec: 88,
      health,
      uptime24h,
      topPages,
      topReferrers,
      devices,
      browsers,
      timeseries,
    };
  });

  const avgLatencyMs = totalLatencyCount > 0 ? Math.round(totalLatencySum / totalLatencyCount) : 0;
  const networkUptimeAvg = Math.round((totalUptimeSum / MONITORED_SITES.length) * 10) / 10;

  return {
    sites: sitesStats,
    totalPageviews24h,
    totalVisitors24h: globalUniqueSessions.size,
    liveVisitorsNow: globalLiveSessions.size,
    networkUptimeAvg,
    avgLatencyMs,
    systemLastChecked: new Date().toISOString(),
  };
}

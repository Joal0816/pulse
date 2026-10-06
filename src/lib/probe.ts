import { MONITORED_SITES, SiteHealthCheck } from "./types";
import { recordHealth, store } from "./store";
import { logAlert } from "./alerts";

export async function pingSite(
  url: string,
  timeoutMs = 7000
): Promise<{ status: number; latencyMs: number; ok: boolean; error?: string }> {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Pulse-Telemetry-Probe/1.0 (+https://pulse.joalvergs.tech)",
        "Accept": "*/*",
      },
      cache: "no-store",
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);
    return {
      status: res.status,
      latencyMs: latency,
      ok: res.ok || (res.status >= 200 && res.status < 400),
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 0,
      latencyMs: latency,
      ok: false,
      error: msg.includes("aborted") ? "Timeout (>7s)" : msg,
    };
  }
}

export async function probeAllSites(force = false): Promise<Record<string, SiteHealthCheck>> {
  const now = Date.now();
  if (!force && now - store.lastChecked < 20000) {
    const latest: Record<string, SiteHealthCheck> = {};
    for (const site of MONITORED_SITES) {
      const hist = store.healthHistory[site.id];
      if (hist && hist.length > 0) {
        latest[site.id] = hist[hist.length - 1];
      }
    }
    if (Object.keys(latest).length === MONITORED_SITES.length) {
      return latest;
    }
  }

  store.lastChecked = now;

  const checks = await Promise.all(
    MONITORED_SITES.map(async (site) => {
      const result = await pingSite(site.url);
      const check: SiteHealthCheck = {
        siteId: site.id,
        timestamp: now,
        status: result.status,
        latencyMs: result.latencyMs,
        ok: result.ok,
        error: result.error,
        checkedAt: new Date(now).toISOString(),
      };

      // Check if alert needs to be triggered
      if (!result.ok) {
        logAlert(site.id, "outage", result.error || `HTTP ${result.status}`, result.status, result.latencyMs);
      } else if (result.latencyMs > 2500) {
        logAlert(site.id, "latency", `High edge latency: ${result.latencyMs}ms`, result.status, result.latencyMs);
      }

      recordHealth(site.id, check);
      return check;
    })
  );

  const map: Record<string, SiteHealthCheck> = {};
  for (const c of checks) {
    map[c.siteId] = c;
  }
  return map;
}

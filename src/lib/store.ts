import { TrackEvent, SiteHealthCheck, MONITORED_SITES } from "./types";

interface MemoryStore {
  events: TrackEvent[];
  healthHistory: Record<string, SiteHealthCheck[]>;
  lastChecked: number;
}

// Global singleton to persist across HMR / module reloads in Node
declare global {
  // eslint-disable-next-line no-var
  var __pulseStore: MemoryStore | undefined;
}

if (!globalThis.__pulseStore) {
  // Seed with realistic baseline analytics so the dashboard is immediately functional
  const now = Date.now();
  const seededEvents: TrackEvent[] = [];

  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  const oss = ["Windows", "macOS", "Linux", "Android", "iOS"];
  const referrers = [
    "",
    "https://github.com/Joal0816",
    "https://google.com",
    "https://twitter.com",
    "https://linkedin.com",
  ];

  MONITORED_SITES.forEach((site, sIdx) => {
    // Seed ~40-120 events spread across past 24 hours
    const eventCount = 40 + (sIdx * 15);
    for (let i = 0; i < eventCount; i++) {
      const timeOffset = Math.random() * 24 * 3600 * 1000;
      const b = browsers[Math.floor(Math.random() * browsers.length)];
      const os = oss[Math.floor(Math.random() * oss.length)];
      const dev = os === "Android" || os === "iOS" ? "mobile" : "desktop";
      const ref = referrers[Math.floor(Math.random() * referrers.length)];

      seededEvents.push({
        site: site.id,
        type: "pageview",
        path: i % 4 === 0 ? "/about" : i % 3 === 0 ? "/docs" : "/",
        session: `s_seed_${site.id}_${i % 12}`,
        timestamp: now - timeOffset,
        browser: b,
        os: os,
        device: dev as "desktop" | "mobile",
        referrer: ref,
      });
    }
  });

  globalThis.__pulseStore = {
    events: seededEvents,
    healthHistory: {},
    lastChecked: 0,
  };
}

export const store = globalThis.__pulseStore!;

export function recordEvent(event: TrackEvent) {
  // Cap in-memory events at 25,000 to maintain optimal memory bounds
  if (store.events.length > 25000) {
    store.events.splice(0, 5000);
  }
  store.events.push(event);
}

export function recordHealth(siteId: string, check: SiteHealthCheck) {
  if (!store.healthHistory[siteId]) {
    store.healthHistory[siteId] = [];
  }
  const hist = store.healthHistory[siteId];
  hist.push(check);
  // Keep last 100 checks per site
  if (hist.length > 100) {
    hist.shift();
  }
}

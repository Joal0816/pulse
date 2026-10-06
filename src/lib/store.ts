import { TrackEvent, SiteHealthCheck } from "./types";
import { getDb } from "./db";

interface MemoryStore {
  healthHistory: Record<string, SiteHealthCheck[]>;
  lastChecked: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __pulseStore: MemoryStore | undefined;
}

if (!globalThis.__pulseStore) {
  globalThis.__pulseStore = {
    healthHistory: {},
    lastChecked: 0,
  };
}

export const store = globalThis.__pulseStore!;

export async function recordEvent(event: TrackEvent) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO pulse_events (
        site, type, path, title, referrer, session, screen, lang, browser, os, device, country, created_at
      ) VALUES (
        ${event.site},
        ${event.type},
        ${event.path},
        ${event.title || null},
        ${event.referrer || null},
        ${event.session},
        ${event.screen || null},
        ${event.lang || null},
        ${event.browser || null},
        ${event.os || null},
        ${event.device || null},
        ${event.country || null},
        ${new Date(event.timestamp).toISOString()}
      )
    `;
  } catch (err) {
    console.error("Failed to insert event to Neon Postgres:", err);
  }
}

export function recordHealth(siteId: string, check: SiteHealthCheck) {
  if (!store.healthHistory[siteId]) {
    store.healthHistory[siteId] = [];
  }
  const hist = store.healthHistory[siteId];
  hist.push(check);
  if (hist.length > 100) {
    hist.shift();
  }
}

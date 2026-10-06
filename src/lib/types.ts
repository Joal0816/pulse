export interface MonitoredSite {
  id: string;
  name: string;
  url: string;
  host: string;
  platform: "Vercel" | "Cloudflare Pages" | "Custom / Supertape";
  description: string;
  tags: string[];
}

export const MONITORED_SITES: MonitoredSite[] = [
  {
    id: "root",
    name: "Joal Vergs Root",
    url: "https://joalvergs.tech",
    host: "joalvergs.tech",
    platform: "Custom / Supertape",
    description: "Main portfolio and apex landing",
    tags: ["apex", "portfolio"],
  },
  {
    id: "agapai",
    name: "AgapAI",
    url: "https://agapai.joalvergs.tech",
    host: "agapai.joalvergs.tech",
    platform: "Vercel",
    description: "Emergency dispatch & AI triage system",
    tags: ["emergency", "ai", "dispatch"],
  },
  {
    id: "aruga",
    name: "ARUGA",
    url: "https://aruga.joalvergs.tech",
    host: "aruga.joalvergs.tech",
    platform: "Cloudflare Pages",
    description: "Fall detection & inactivity computer vision monitoring",
    tags: ["eldercare", "cv", "yolo"],
  },
  {
    id: "barangay-connect",
    name: "Barangay Connect",
    url: "https://barangay-connect.joalvergs.tech",
    host: "barangay-connect.joalvergs.tech",
    platform: "Vercel",
    description: "Citizen portal & barangay governance management",
    tags: ["govtech", "community"],
  },
  {
    id: "cup",
    name: "Sustainability in the Cup",
    url: "https://cup.joalvergs.tech",
    host: "cup.joalvergs.tech",
    platform: "Cloudflare Pages",
    description: "Coffee sustainability lifecycle assessment & tracker",
    tags: ["sustainability", "research"],
  },
  {
    id: "oddjobs",
    name: "OddJobs Web",
    url: "https://oddjobs.joalvergs.tech",
    host: "oddjobs.joalvergs.tech",
    platform: "Vercel",
    description: "Local micro-services and freelance work marketplace",
    tags: ["marketplace", "technopreneurship"],
  },
  {
    id: "oink",
    name: "O.I.N.K.",
    url: "https://oink.joalvergs.tech",
    host: "oink.joalvergs.tech",
    platform: "Vercel",
    description: "Smart livestock & swine health monitoring system",
    tags: ["agritech", "iot"],
  },
];

export type UADetails = {
  browser: string;
  os: string;
  device: "desktop" | "mobile" | "tablet";
};

export interface TrackEvent {
  site: string;
  type: string;
  path: string;
  title?: string;
  referrer?: string;
  session: string;
  screen?: string;
  lang?: string;
  timestamp: number;
  browser?: string;
  os?: string;
  device?: "desktop" | "mobile" | "tablet";
  country?: string;
}

export interface SiteHealthCheck {
  siteId: string;
  timestamp: number;
  status: number | 0;
  latencyMs: number;
  ok: boolean;
  error?: string;
  checkedAt: string;
}

export interface SiteStats {
  site: MonitoredSite;
  pageviews24h: number;
  visitors24h: number;
  liveVisitors: number;
  bounceRate: number;
  avgDurationSec: number;
  health: SiteHealthCheck;
  uptime24h: number;
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  devices: { name: string; count: number; pct: number }[];
  browsers: { name: string; count: number; pct: number }[];
  timeseries: { hour: string; views: number; visitors: number }[];
}

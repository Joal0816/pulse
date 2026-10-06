import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/store";
import { parseUserAgent } from "@/lib/analytics";
import { TrackEvent, MONITORED_SITES } from "@/lib/types";
import crypto from "crypto";

// Allowed origins: self and any joalvergs.tech domain / subdomain (single or multi-level)
const ALLOWED_ORIGIN_REGEX = /^https?:\/\/(localhost(:\d+)?|([a-z0-9-]+\.)*joalvergs\.tech)$/i;

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && ALLOWED_ORIGIN_REGEX.test(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://joalvergs.tech",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Body must be an object" }, { status: 400, headers: corsHeaders });
    }

    // Site validation: must match known site or follow safe slug format
    const rawSite = typeof body.site === "string" ? body.site.trim().toLowerCase() : "";
    const isKnownSite = MONITORED_SITES.some((s) => s.id === rawSite);
    const isValidSlug = /^[a-z0-9-_]{1,50}$/.test(rawSite);
    if (!rawSite || (!isKnownSite && !isValidSlug)) {
      return NextResponse.json({ ok: false, error: "Invalid site identifier" }, { status: 400, headers: corsHeaders });
    }

    // Path validation
    const rawPath = typeof body.path === "string" ? body.path : "/";
    const sanitizedPath = rawPath.startsWith("/") ? rawPath.slice(0, 500) : "/" + rawPath.slice(0, 499);

    // High-entropy session validation
    const rawSession = typeof body.session === "string" ? body.session : "";
    const sanitizedSession = /^[a-zA-Z0-9_-]{1,64}$/.test(rawSession)
      ? rawSession
      : `anon_${crypto.randomBytes(12).toString("hex")}`;

    // Timestamp validation: clamp within 1 hour future and 7 days past
    const now = Date.now();
    let timestamp = Number(body.timestamp);
    if (isNaN(timestamp) || timestamp < now - 7 * 86400 * 1000 || timestamp > now + 3600 * 1000) {
      timestamp = now;
    }

    // Safe user-agent parsing wrapped in try/catch to avoid failure cascades
    let uaDetails = { browser: "Unknown", os: "Unknown", device: "desktop" as const };
    try {
      const ua = (req.headers.get("user-agent") || "").slice(0, 500);
      uaDetails = parseUserAgent(ua);
    } catch {
      // Fallback defaults preserved
    }

    // Geo headers (Vercel / Cloudflare edge sanitized)
    const rawCountry = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry");
    const country = rawCountry && /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : undefined;

    const event: TrackEvent = {
      site: rawSite,
      type: typeof body.type === "string" && ["pageview", "event"].includes(body.type) ? body.type : "pageview",
      path: sanitizedPath,
      title: typeof body.title === "string" ? body.title.slice(0, 200) : undefined,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : undefined,
      session: sanitizedSession,
      screen: typeof body.screen === "string" && /^\d{2,5}x\d{2,5}$/.test(body.screen) ? body.screen : undefined,
      lang: typeof body.lang === "string" ? body.lang.slice(0, 16) : undefined,
      timestamp,
      browser: uaDetails.browser,
      os: uaDetails.os,
      device: uaDetails.device,
      country,
    };

    recordEvent(event);

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

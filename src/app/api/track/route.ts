import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/store";
import { parseUserAgent } from "@/lib/analytics";
import { TrackEvent, MONITORED_SITES } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const siteId = String(body.site || "").trim().toLowerCase();
    const isKnownSite = MONITORED_SITES.some((s) => s.id === siteId);

    // Accept even if not pre-registered to avoid dropping ad-hoc subdomains
    const ua = req.headers.get("user-agent") || "";
    const { browser, os, device } = parseUserAgent(ua);
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || undefined;

    const event: TrackEvent = {
      site: siteId || "unknown",
      type: body.type || "pageview",
      path: String(body.path || "/").slice(0, 500),
      title: body.title ? String(body.title).slice(0, 200) : undefined,
      referrer: body.referrer ? String(body.referrer).slice(0, 500) : undefined,
      session: String(body.session || "anon").slice(0, 64),
      screen: body.screen ? String(body.screen).slice(0, 32) : undefined,
      lang: body.lang ? String(body.lang).slice(0, 16) : undefined,
      timestamp: Number(body.timestamp) || Date.now(),
      browser,
      os,
      device,
      country,
    };

    recordEvent(event);

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    return new NextResponse(JSON.stringify({ ok: false, error: "Invalid payload" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

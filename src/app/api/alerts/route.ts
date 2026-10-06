import { NextRequest, NextResponse } from "next/server";
import { getRecentAlerts } from "@/lib/alerts";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const alerts = await getRecentAlerts(20);
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const webhookUrl = typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : null;
    const latencyThreshold = Number(body.latencyThreshold) || 2000;

    const sql = getDb();
    await sql`
      INSERT INTO pulse_alert_configs (channel, webhook_url, latency_threshold_ms, enabled)
      VALUES ('webhook', ${webhookUrl}, ${latencyThreshold}, true);
    `;

    return NextResponse.json({ ok: true, message: "Alert channel saved successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save alert configuration";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

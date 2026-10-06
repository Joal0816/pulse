import { NextRequest, NextResponse } from "next/server";
import { getRecentAlerts, getAlertConfigs } from "@/lib/alerts";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const alerts = await getRecentAlerts(20);
  const config = await getAlertConfigs();
  return NextResponse.json({ alerts, config });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const webhookUrl = typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : null;
    const personalEmail =
      typeof body.personalEmail === "string"
        ? body.personalEmail.trim()
        : "hpesojnalab.aragrev@gmail.com";
    const institutionalEmail =
      typeof body.institutionalEmail === "string"
        ? body.institutionalEmail.trim()
        : "josephalan.vergara@g.msuiit.edu.ph";
    const latencyThreshold = Number(body.latencyThreshold) || 2000;

    const sql = getDb();
    await sql`
      INSERT INTO pulse_alert_configs (
        channel, webhook_url, personal_email, institutional_email, latency_threshold_ms, enabled
      ) VALUES (
        'multi-channel', ${webhookUrl}, ${personalEmail}, ${institutionalEmail}, ${latencyThreshold}, true
      );
    `;

    return NextResponse.json({
      ok: true,
      message: "Alert channels (Webhook & Gmails) saved successfully",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save alert configuration";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

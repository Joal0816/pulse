import { getDb } from "./db";

export async function logAlert(
  site: string,
  type: "outage" | "latency" | "recovered",
  message: string,
  statusCode?: number,
  latencyMs?: number
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO pulse_alerts (site, type, message, status_code, latency_ms)
      VALUES (${site}, ${type}, ${message}, ${statusCode || null}, ${latencyMs || null});
    `;

    // Fetch active webhook configs
    const configs = await sql`
      SELECT webhook_url, latency_threshold_ms FROM pulse_alert_configs
      WHERE enabled = true AND webhook_url IS NOT NULL;
    `;

    for (const conf of configs) {
      if (conf.webhook_url) {
        // Send alert asynchronously to Discord/Telegram/Slack webhook
        fetch(conf.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🚨 **Pulse Telemetry Alert: ${site}**\n**Status:** ${type.toUpperCase()}\n**Details:** ${message}\n**Code:** ${statusCode || "N/A"} | **Latency:** ${latencyMs || "N/A"}ms`,
          }),
        }).catch((err) => console.error("Webhook dispatch failed:", err));
      }
    }
  } catch (err) {
    console.error("Failed to log alert:", err);
  }
}

export async function getRecentAlerts(limit = 10) {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT id, site, type, message, status_code, latency_ms, created_at
      FROM pulse_alerts
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    return rows.map((r: any) => ({
      id: r.id,
      site: r.site,
      type: r.type,
      message: r.message,
      statusCode: r.status_code,
      latencyMs: r.latency_ms,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("Failed to retrieve alerts:", err);
    return [];
  }
}

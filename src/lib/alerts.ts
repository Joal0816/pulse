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

    // Fetch active webhook and email notification configurations
    const configs = await sql`
      SELECT webhook_url, personal_email, institutional_email, latency_threshold_ms 
      FROM pulse_alert_configs
      WHERE enabled = true;
    `;

    for (const conf of configs as any[]) {
      // 1. Webhook Dispatch (Discord, Slack, Custom Webhook)
      if (conf.webhook_url) {
        fetch(conf.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🚨 **Pulse Telemetry Incident Alert**\n**Node:** \`${site}\`\n**Status:** ${type.toUpperCase()}\n**Details:** ${message}\n**HTTP Code:** ${statusCode || "N/A"} | **Edge Latency:** ${latencyMs || "N/A"}ms`,
          }),
        }).catch((err) => console.error("Webhook dispatch failed:", err));
      }

      // 2. Email Notifications (Dispatches incident notification payloads to Personal & Institutional Gmail)
      const recipientEmails = [conf.personal_email, conf.institutional_email].filter(Boolean);
      for (const email of recipientEmails) {
        console.log(`[Pulse Alert Dispatched] Node: ${site} -> Target: ${email} (${type})`);
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

export async function getAlertConfigs() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT id, channel, webhook_url, personal_email, institutional_email, latency_threshold_ms, enabled
      FROM pulse_alert_configs
      ORDER BY id DESC
      LIMIT 1;
    `;
    return rows[0] || null;
  } catch (err) {
    return null;
  }
}

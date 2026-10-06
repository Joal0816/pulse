import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const site = req.nextUrl.searchParams.get("site");
  const sql = getDb();

  try {
    const rows = site
      ? await sql`
          SELECT id, site, type, path, title, referrer, session, browser, os, device, country, created_at
          FROM pulse_events
          WHERE site = ${site}
          ORDER BY created_at DESC
          LIMIT 5000;
        `
      : await sql`
          SELECT id, site, type, path, title, referrer, session, browser, os, device, country, created_at
          FROM pulse_events
          ORDER BY created_at DESC
          LIMIT 5000;
        `;

    const headers = [
      "id",
      "site",
      "type",
      "path",
      "title",
      "referrer",
      "session",
      "browser",
      "os",
      "device",
      "country",
      "created_at",
    ];

    const csvLines = [headers.join(",")];
    for (const r of rows as any[]) {
      const line = headers.map((h) => {
        const val = r[h] !== null && r[h] !== undefined ? String(r[h]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvLines.push(line.join(","));
    }

    const csvContent = csvLines.join("\n");
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pulse-events-${site || "all"}-${Date.now()}.csv"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to export data";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

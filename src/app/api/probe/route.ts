import { NextResponse } from "next/server";
import { probeAllSites } from "@/lib/probe";

export const dynamic = "force-dynamic";

export async function POST() {
  const checks = await probeAllSites(true);
  return NextResponse.json({ ok: true, timestamp: Date.now(), checks });
}

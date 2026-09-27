import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "pulso", ts: new Date().toISOString() });
}

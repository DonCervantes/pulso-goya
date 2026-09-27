import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminMetrics } from "@/lib/store";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await adminMetrics());
}

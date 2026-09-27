import { NextResponse, after } from "next/server";
import { getSession } from "@/lib/session";
import { closeIncident, getIncident } from "@/lib/store";
import { anchorIncidentPhase } from "@/lib/anchor";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user || (user.role !== "family" && user.role !== "user")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const inc = await getIncident(id);
  if (!inc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { reason?: "resolved" | "false_alarm" };
  const reason = body.reason === "false_alarm" ? "false_alarm" : "resolved";
  const updated = await closeIncident(id, user.id, reason);
  after(() => anchorIncidentPhase(id, reason === "false_alarm" ? "false_alarm" : "closed"));
  return NextResponse.json({ status: updated?.status });
}

import { NextResponse, after } from "next/server";
import { getSession } from "@/lib/session";
import { acknowledgeIncident } from "@/lib/store";
import { anchorIncidentPhase } from "@/lib/anchor";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user || user.role !== "family") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const inc = await acknowledgeIncident(id, user.id);
  if (!inc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  after(() => anchorIncidentPhase(id, "family_ack"));
  return NextResponse.json({ status: inc.status });
}

import { NextResponse, after } from "next/server";
import { getSession } from "@/lib/session";
import { createIncident, listIncidentsForUser } from "@/lib/store";
import { anchorIncidentPhase } from "@/lib/anchor";

// POST /api/incidents — crea un incidente idempotente (botón de pánico).
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { clientEventId?: string };
  const clientEventId = body.clientEventId?.trim();
  if (!clientEventId) {
    return NextResponse.json({ error: "clientEventId requerido" }, { status: 400 });
  }
  const { incident, duplicated } = await createIncident(user.id, clientEventId, "web");
  if (!duplicated) {
    // Anclaje OPENED en segundo plano: no retrasa la respuesta ni bloquea la alerta.
    after(() => anchorIncidentPhase(incident.id, "opened"));
  }
  return NextResponse.json(
    { incidentId: incident.id, status: incident.status, duplicated, serverTime: new Date().toISOString() },
    { status: duplicated ? 200 : 201 },
  );
}

// GET /api/incidents — incidentes del usuario en sesión.
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ incidents: await listIncidentsForUser(user.id) });
}

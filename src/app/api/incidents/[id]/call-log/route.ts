import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { logCall } from "@/lib/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user || user.role !== "family") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    result?: string;
    folio?: string;
  };
  const inc = await logCall(id, user.id, body);
  if (!inc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ status: inc.status });
}

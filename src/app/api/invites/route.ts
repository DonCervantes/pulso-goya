import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createInvite } from "@/lib/store";
import { sendInviteEmail } from "@/lib/email";

// POST /api/invites — el usuario senior genera un enlace de invitación familiar.
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const invite = await createInvite(user.id, body.email);

  if (body.email) {
    try {
      await sendInviteEmail({ to: body.email, userName: user.displayName, token: invite.token });
    } catch {
      // El enlace sigue siendo válido aunque falle el correo (se muestra en UI).
    }
  }
  return NextResponse.json({ token: invite.token, expiresAt: invite.expiresAt });
}

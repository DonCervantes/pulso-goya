import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { upsertPollarUser } from "@/lib/store";

// Binding demo (v1): el cliente reporta identidad de Pollar (wallet + correo)
// tras un login verificado. Hacemos upsert y creamos la sesión de Pulso.
// NOTA: nivel demo — se confía en el cliente. Endurecer con firma de reto (V07).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    walletAddress?: string;
    email?: string;
    displayName?: string;
    pollarSubject?: string;
  };
  if (!body.walletAddress) {
    return NextResponse.json({ error: "walletAddress requerido" }, { status: 400 });
  }
  const { user, isNew } = await upsertPollarUser({
    walletAddress: body.walletAddress,
    email: body.email,
    displayName: body.displayName,
    pollarSubject: body.pollarSubject,
  });
  await setSession(user.id);
  return NextResponse.json({
    userId: user.id,
    isNew,
    needsOnboarding: !user.onboarded,
  });
}

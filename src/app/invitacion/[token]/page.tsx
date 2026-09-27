import { acceptInviteAction } from "@/app/actions";
import { getInvite, getUser } from "@/lib/store";

export default async function InvitacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const invite = await getInvite(token);
  const owner = invite ? await getUser(invite.userId) : undefined;

  const invalid = !invite || invite.status !== "pending";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-extrabold">Invitación a Pulso</h1>

      {invalid ? (
        <p className="rounded-lg border border-[var(--color-danger)] bg-white p-4 text-[var(--color-danger)]">
          Esta invitación no es válida o ya expiró. Pide a tu familiar que te envíe una nueva.
        </p>
      ) : (
        <>
          <p className="text-lg">
            <strong>{owner?.displayName ?? "Un familiar"}</strong> te invitó a unirte a su red de
            apoyo. Al aceptar, recibirás sus alertas y podrás confirmar que las atiendes.
          </p>
          {error && (
            <p role="alert" className="rounded-lg border border-[var(--color-danger)] bg-white p-3 text-[var(--color-danger)]">
              Revisa los datos e intenta de nuevo.
            </p>
          )}
          <form action={acceptInviteAction} className="flex flex-col gap-3">
            <input type="hidden" name="token" value={token} />
            <label className="font-medium">Tu nombre</label>
            <input name="name" required placeholder="Ej. Luis Pérez" className="rounded-lg border border-[var(--color-border)] p-3" />
            <label className="font-medium">Tu correo</label>
            <input name="email" type="email" required placeholder="tucorreo@ejemplo.mx" className="rounded-lg border border-[var(--color-border)] p-3" />
            <button className="rounded-lg bg-[var(--color-primary)] px-5 py-3 font-semibold text-white">
              Aceptar invitación
            </button>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Demo: el login real será con Pollar (código por correo).
            </p>
          </form>
        </>
      )}
    </main>
  );
}

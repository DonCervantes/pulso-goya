import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAmbulancesByIds, listAmbulances, listContacts } from "@/lib/store";
import InviteButton from "@/components/InviteButton";

export default async function ContactosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  const contacts = await listContacts(user.id);
  const preferred = await getAmbulancesByIds(user.preferredAmbulanceIds ?? []);
  const allAmbulances = await listAmbulances(user.zone);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Mis contactos y ayuda</h1>

      <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-bold">Contactos de confianza</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex justify-between border-b border-[var(--color-border-soft)] pb-2">
              <span>
                {c.name} <span className="text-sm text-[var(--color-text-secondary)]">· {c.relationship}</span>
              </span>
              <span className="text-sm text-[var(--color-success)]">
                {c.verifiedAt ? "verificado" : "pendiente"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <InviteButton />

      <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-bold">Ambulancias preseleccionadas</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Estos números aparecerán durante un incidente. (Edición completa: próxima versión.)
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {preferred.map((a) => (
            <li key={a.id} className="flex justify-between">
              <span>{a.name}</span>
              <span className="font-semibold">{a.phone}</span>
            </li>
          ))}
          {preferred.length === 0 && (
            <li className="text-sm text-[var(--color-text-secondary)]">Ninguna seleccionada.</li>
          )}
        </ul>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-[var(--color-primary)]">
            Ver todas las opciones de tu zona
          </summary>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {allAmbulances.map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{a.name}</span>
                <span>{a.phone}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}

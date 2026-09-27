import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAmbulancesByIds, getTodayCheckin, listIncidentsForUser } from "@/lib/store";
import PanicButton from "@/components/PanicButton";
import { formatMx } from "@/lib/format";

export default async function InicioPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  const ambulances = await getAmbulancesByIds(user.preferredAmbulanceIds ?? []);
  const todayCheckin = await getTodayCheckin(user.id);
  const openIncident = (await listIncidentsForUser(user.id)).find(
    (i) => i.status !== "resolved" && i.status !== "false_alarm",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold">Hola, {user.displayName.split(" ")[0]}</h1>
        <p className="text-[var(--color-text-secondary)]">
          Sesión activa ·{" "}
          {ambulances.length > 0
            ? `Ambulancia: ${ambulances.map((a) => a.name).join(", ")}`
            : "Sin ambulancia preseleccionada"}
        </p>
      </div>

      {openIncident && (
        <Link
          href={`/incidente/${openIncident.id}`}
          className="rounded-xl border-2 border-[var(--color-danger)] bg-white p-4 font-semibold text-[var(--color-danger)]"
        >
          Tienes un incidente activo — abrir ({formatMx(openIncident.openedAt)})
        </Link>
      )}

      <PanicButton />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/chequeo" className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
          <span className="text-lg font-bold">Hacer mi chequeo de hoy</span>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {todayCheckin
              ? todayCheckin.score0to100 !== null
                ? `Hecho hoy · ${todayCheckin.score0to100}/100`
                : "Hecho hoy · sin puntaje"
              : "Aún no lo haces hoy"}
          </p>
        </Link>
        <Link href="/contactos" className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
          <span className="text-lg font-bold">Mis contactos de ayuda</span>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Ver e invitar familia</p>
        </Link>
        <Link href="/recomendaciones" className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 sm:col-span-2">
          <span className="text-lg font-bold">Recomendaciones para mí</span>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Farmacias, hospitales y doctores cercanos
          </p>
        </Link>
      </div>
    </div>
  );
}

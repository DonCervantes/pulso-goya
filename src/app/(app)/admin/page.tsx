import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { adminMetrics, listIncidents, listUsers } from "@/lib/store";
import { formatMx } from "@/lib/format";
import AIRecommendations from "@/components/AIRecommendations";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const m = await adminMetrics();
  const users = await listUsers();
  const incidents = (await listIncidents()).slice(0, 10);

  const cards = [
    { label: "Usuarios", value: m.totalUsers },
    { label: "Familiares", value: m.totalFamily },
    { label: "Incidentes", value: m.totalIncidents },
    { label: "Incidentes abiertos", value: m.openIncidents },
    { label: "Tasa de acuse", value: `${m.acknowledgedRate}%` },
    { label: "Chequeos", value: m.totalCheckins },
    { label: "Bienestar promedio", value: m.avgWellbeingScore !== null ? `${m.avgWellbeingScore}/100` : "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Panel de administración</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Métricas agregadas. Sin acceso a datos clínicos por defecto.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
            <p className="text-2xl font-extrabold text-[var(--color-primary)]">{c.value}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{c.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-bold">Usuarios</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between border-b border-[var(--color-border-soft)] pb-1">
              <span>{u.displayName}</span>
              <span className="text-[var(--color-text-secondary)]">{u.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-bold">Incidentes recientes</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {incidents.length === 0 && (
            <li className="text-[var(--color-text-secondary)]">Aún no hay incidentes.</li>
          )}
          {incidents.map((i) => (
            <li key={i.id} className="flex justify-between border-b border-[var(--color-border-soft)] pb-1">
              <span>{i.id}</span>
              <span>{i.status}</span>
              <span className="text-[var(--color-text-secondary)]">{formatMx(i.openedAt)}</span>
            </li>
          ))}
        </ul>
      </section>

      <AIRecommendations
        title="Recomendaciones generales (IA)"
        description="Salud preventiva para la población del piloto y sugerencias operativas, a partir de métricas agregadas (sin datos clínicos individuales)."
        cta="Generar con IA"
      />

      <section className="rounded-2xl border border-dashed border-[var(--color-border)] p-5 text-sm text-[var(--color-text-secondary)]">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Próxima versión (v2)</h2>
        <p className="mt-1">Farmacias/hospitales cercanos reales (Google Places) se integrarán aquí.</p>
      </section>
    </div>
  );
}

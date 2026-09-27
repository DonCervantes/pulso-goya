import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUser, listIncidentsForFamily } from "@/lib/store";
import { formatMx } from "@/lib/format";
import type { Incident } from "@/lib/types";

const STATUS_LABEL: Record<Incident["status"], string> = {
  created: "Nueva",
  family_acknowledged: "Confirmada",
  contacting: "En atención",
  resolved: "Cerrada",
  false_alarm: "Falsa alarma",
};

export default async function FamiliarPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "family") redirect("/");

  const incidents = await listIncidentsForFamily(user.id);

  // Precalcular nombres de dueños (evita lookups async en el render).
  const ownerIds = [...new Set(incidents.map((i) => i.userId))];
  const owners = new Map<string, string>();
  await Promise.all(
    ownerIds.map(async (id) => {
      const u = await getUser(id);
      owners.set(id, u?.displayName ?? "Usuario");
    }),
  );

  const nuevas = incidents.filter((i) => i.status === "created");
  const atendidas = incidents.filter(
    (i) => i.status === "family_acknowledged" || i.status === "contacting",
  );
  const cerradas = incidents.filter(
    (i) => i.status === "resolved" || i.status === "false_alarm",
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Alertas de tu familia</h1>

      {incidents.length === 0 && (
        <p className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 text-[var(--color-text-secondary)]">
          No hay alertas por ahora. Aquí verás si un ser querido pide ayuda.
        </p>
      )}

      <Group title="Nuevas" items={nuevas} owners={owners} highlight />
      <Group title="Atendidas" items={atendidas} owners={owners} />
      <Group title="Cerradas" items={cerradas} owners={owners} />
    </div>
  );
}

function Group({
  title,
  items,
  owners,
  highlight,
}: {
  title: string;
  items: Incident[];
  owners: Map<string, string>;
  highlight?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((i) => (
          <li key={i.id}>
            <Link
              href={`/familiar/${i.id}`}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                highlight
                  ? "border-[var(--color-danger)] bg-white"
                  : "border-[var(--color-border-soft)] bg-[var(--color-surface)]"
              }`}
            >
              <span>
                <span className="font-semibold">{owners.get(i.userId) ?? "Usuario"}</span>
                <span className="block text-sm text-[var(--color-text-secondary)]">
                  {formatMx(i.openedAt)}
                </span>
              </span>
              <span className={highlight ? "font-bold text-[var(--color-danger)]" : "text-sm"}>
                {STATUS_LABEL[i.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

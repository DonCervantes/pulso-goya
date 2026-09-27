import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listCheckins } from "@/lib/store";
import CheckinFlow from "@/components/CheckinFlow";
import { formatMx } from "@/lib/format";

export default async function ChequeoPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  const history = (await listCheckins(user.id)).slice(0, 7);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Chequeo de hoy</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Puedes omitir este chequeo. Es autorreporte, no un diagnóstico.
      </p>
      <CheckinFlow />

      {history.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
          <h2 className="text-lg font-bold">Tus últimos chequeos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((c) => (
              <li key={c.id} className="flex justify-between border-b border-[var(--color-border-soft)] pb-2 text-sm">
                <span>{c.localDay}</span>
                <span className="font-semibold">
                  {c.score0to100 !== null ? `${c.score0to100}/100` : "Sin puntaje"}
                </span>
                <span className="text-[var(--color-text-secondary)]">{formatMx(c.completedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listPlaces } from "@/lib/store";
import type { PlaceType } from "@/lib/types";
import AIRecommendations from "@/components/AIRecommendations";

const SECTIONS: { type: PlaceType; title: string; icon: string }[] = [
  { type: "pharmacy", title: "Farmacias cercanas", icon: "💊" },
  { type: "hospital", title: "Hospitales cercanos", icon: "🏥" },
  { type: "doctor", title: "Doctores", icon: "🩺" },
];

export default async function RecomendacionesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  const placesByType = Object.fromEntries(
    await Promise.all(SECTIONS.map(async (s) => [s.type, await listPlaces(s.type)] as const)),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Recomendaciones para ti</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Recomendaciones de salud con IA (Groq), personalizadas a tu chequeo. Los lugares cercanos
          son de ejemplo por ahora (Google Places en la próxima versión).
        </p>
      </div>

      <AIRecommendations
        title="Recomendaciones para ti"
        description="Basadas en tu tendencia de bienestar reportado."
        cta="Generar con IA"
      />

      <div className="rounded-lg bg-[var(--color-warning-bg)] p-3 text-sm text-[var(--color-warning)]">
        Estas recomendaciones son informativas y no sustituyen a un profesional de salud.
      </div>

      {SECTIONS.map((s) => {
        const places = placesByType[s.type] ?? [];
        return (
          <section key={s.type} className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-bold">
              {s.icon} {s.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {places.map((p) => (
                <li key={p.id} className="border-b border-[var(--color-border-soft)] pb-2">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {p.address} · {p.zone}
                  </p>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="text-sm font-semibold text-[var(--color-primary)]">
                      📞 {p.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AIRecommendations from "@/components/AIRecommendations";
import NearbyPlaces from "@/components/NearbyPlaces";

export default async function RecomendacionesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "user") redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Recomendaciones para ti</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Recomendaciones de salud con IA (Groq) personalizadas a tu chequeo, y farmacias,
          hospitales y doctores cercanos (Google Places).
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

      <NearbyPlaces />
    </div>
  );
}

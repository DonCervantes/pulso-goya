import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminMetrics, listCheckins } from "@/lib/store";
import { HEALTH_SYSTEM_PROMPT, groqChat, isGroqConfigured } from "@/lib/groq";

// POST /api/ai/recommendations — recomendaciones de bienestar con Groq.
// Usuario: personalizadas a su tendencia de chequeos. Admin: generales + operativas.
export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!isGroqConfigured()) {
    return NextResponse.json({ error: "IA no configurada" }, { status: 503 });
  }

  try {
    if (user.role === "admin") {
      const m = await adminMetrics();
      const prompt =
        `Métricas agregadas del piloto (no son datos clínicos individuales): ` +
        `usuarios=${m.totalUsers}, familiares=${m.totalFamily}, incidentes=${m.totalIncidents}, ` +
        `incidentes abiertos=${m.openIncidents}, tasa de acuse=${m.acknowledgedRate}%, ` +
        `chequeos=${m.totalCheckins}, bienestar promedio=${m.avgWellbeingScore ?? "N/D"}/100. ` +
        `Da recomendaciones GENERALES de salud preventiva para esta población de adultos mayores y ` +
        `2 sugerencias operativas para el equipo del piloto.`;
      const text = await groqChat([
        { role: "system", content: HEALTH_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ]);
      return NextResponse.json({ text });
    }

    if (user.role !== "user") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const checkins = (await listCheckins(user.id))
      .filter((c) => c.score0to100 !== null)
      .slice(0, 7);
    const trend =
      checkins.length > 0
        ? checkins.map((c) => `${c.localDay}: ${c.score0to100}/100`).join("; ")
        : "sin chequeos recientes";
    const prompt =
      `La persona reportó su bienestar diario (índice 0-100, mayor = se sintió mejor): ${trend}. ` +
      `Es autorreporte, no un diagnóstico. Da recomendaciones GENERALES de bienestar acordes a esta ` +
      `tendencia (sueño, energía, ánimo, actividad física ligera, molestias). Si no hay datos, da ` +
      `consejos generales de bienestar para un adulto mayor.`;
    const text = await groqChat([
      { role: "system", content: HEALTH_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]);
    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de IA";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

// Cliente de Groq (API compatible con OpenAI). Recomendaciones de bienestar.
// Si no hay GROQ_API_KEY, isGroqConfigured() es false y la UI oculta la función.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function groqChat(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq no configurado");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts?.temperature ?? 0.5,
      max_tokens: opts?.maxTokens ?? 500,
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// Guardarraíles compartidos para recomendaciones de salud.
export const HEALTH_SYSTEM_PROMPT =
  "Eres un asistente de bienestar de Pulso para adultos mayores en México (es-MX). " +
  "Das recomendaciones GENERALES de bienestar, breves, cálidas y accionables. " +
  "NUNCA diagnosticas, no recetas medicamentos ni dosis, no afirmas que la persona tiene una enfermedad. " +
  "Si describen señales de urgencia (dolor de pecho, dificultad para respirar, confusión súbita, debilidad de un lado del cuerpo), indica llamar al 911 de inmediato. " +
  "Cierra recordando consultar a un profesional de salud ante dudas. " +
  "Responde en español (es-MX), en 3 a 5 viñetas cortas.";

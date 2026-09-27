"use client";

import { useState } from "react";

export default function AIRecommendations({
  title = "Recomendaciones con IA",
  description,
  cta = "Generar recomendaciones",
}: {
  title?: string;
  description?: string;
  cta?: string;
}) {
  const [text, setText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/recommendations", { method: "POST" });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar");
      setText(data.text ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setBusy(false);
    }
  }

  // Divide el texto en líneas/viñetas para mostrarlo ordenado.
  const lines = (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
    .filter(Boolean);

  return (
    <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">✦ {title}</h2>
        <button
          onClick={generate}
          disabled={busy}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Generando…" : text ? "Actualizar" : cta}
        </button>
      </div>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {text && (
        <ul className="mt-4 flex flex-col gap-2">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2 text-[var(--color-text)]">
              <span aria-hidden className="text-[var(--color-primary)]">•</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}

      {text && (
        <p className="mt-4 rounded-lg bg-[var(--color-warning-bg)] p-3 text-xs text-[var(--color-warning)]">
          Recomendaciones generales de IA. No son diagnóstico ni sustituyen a un profesional de
          salud. Ante una urgencia, llama al 911.
        </p>
      )}
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HOLD_MS = 2000;

export default function PanicButton() {
  const router = useRouter();
  const [progress, setProgress] = useState(0); // 0..1
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const firedRef = useRef(false);

  function cancelHold() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (!firedRef.current) setProgress(0);
  }

  function tick(now: number) {
    const elapsed = now - startRef.current;
    const p = Math.min(elapsed / HOLD_MS, 1);
    setProgress(p);
    if (p >= 1) {
      firedRef.current = true;
      void trigger();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function startHold() {
    if (sending || firedRef.current) return;
    setError(null);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }

  async function trigger() {
    setSending(true);
    try {
      const clientEventId =
        (crypto.randomUUID?.() as string) ?? String(Date.now() + Math.random());
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientEventId }),
      });
      if (!res.ok) throw new Error("No se pudo enviar");
      const data = (await res.json()) as { incidentId: string };
      router.push(`/incidente/${data.incidentId}`);
    } catch {
      setError("No pudimos confirmar el envío. Intenta de nuevo o llama al 911.");
      setSending(false);
      firedRef.current = false;
      setProgress(0);
    }
  }

  const pct = Math.round(progress * 100);

  return (
    <div className="w-full">
      <button
        type="button"
        aria-label="Necesito ayuda. Mantén presionado dos segundos para pedir ayuda."
        disabled={sending}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        className="relative w-full overflow-hidden rounded-2xl bg-[var(--color-danger)] px-6 py-10 text-center text-white shadow-lg transition active:scale-[0.99] disabled:opacity-70"
        style={{ minHeight: 140, touchAction: "none" }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-[var(--color-danger-dark)]"
          style={{ width: `${pct}%`, transition: "width 60ms linear" }}
        />
        <span className="relative flex flex-col items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            🔴 NECESITO AYUDA
          </span>
          <span className="text-lg font-medium">
            {sending
              ? "Enviando…"
              : pct > 0 && pct < 100
                ? `Mantén presionado… ${pct}%`
                : "Mantén presionado 2 segundos"}
          </span>
        </span>
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-[var(--color-danger)] bg-white p-3 text-[var(--color-danger)]"
        >
          {error}{" "}
          <a href="tel:911" className="font-bold underline">
            Llamar al 911
          </a>
        </p>
      )}
      <p className="mt-3 text-center text-sm text-[var(--color-text-secondary)]">
        Suelta antes de completar para cancelar. Una sola pulsación no envía nada.
      </p>
    </div>
  );
}

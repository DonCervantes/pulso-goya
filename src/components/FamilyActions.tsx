"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FamilyActions({
  incidentId,
  closed,
}: {
  incidentId: string;
  closed: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [showCall, setShowCall] = useState(false);

  async function post(path: string, body?: object) {
    setBusy(path);
    try {
      await fetch(`/api/incidents/${incidentId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      router.refresh();
    } finally {
      setBusy(null);
      setShowCall(false);
    }
  }

  if (closed) {
    return (
      <p className="rounded-lg bg-[var(--color-surface)] p-4 text-[var(--color-success)]">
        ✓ Caso cerrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => post("ack")}
        disabled={!!busy}
        className="rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {busy === "ack" ? "Guardando…" : "Confirmo que recibí la alerta"}
      </button>

      <a
        href="tel:911"
        className="rounded-xl border-2 border-[var(--color-danger)] px-5 py-4 text-center text-lg font-semibold text-[var(--color-danger)]"
      >
        📞 Llamar al 911
      </a>

      {!showCall ? (
        <button
          onClick={() => setShowCall(true)}
          className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-[var(--color-text)]"
        >
          Registrar que llamé al 911
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            post("call-log", {
              result: String(fd.get("result") ?? ""),
              folio: String(fd.get("folio") ?? ""),
            });
          }}
          className="flex flex-col gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
        >
          <label className="text-sm font-medium">Resultado de la llamada</label>
          <input
            name="result"
            placeholder="Ej. Ambulancia en camino"
            className="rounded-lg border border-[var(--color-border)] p-3"
          />
          <label className="text-sm font-medium">Folio (opcional)</label>
          <input
            name="folio"
            placeholder="Número de folio si te lo dieron"
            className="rounded-lg border border-[var(--color-border)] p-3"
          />
          <button
            type="submit"
            disabled={!!busy}
            className="mt-1 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-semibold text-white"
          >
            Guardar llamada
          </button>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Registrar la llamada no marca “autoridad avisada” automáticamente.
          </p>
        </form>
      )}

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => post("close", { reason: "resolved" })}
          disabled={!!busy}
          className="flex-1 rounded-xl bg-[var(--color-success)] px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          Cerrar: atendido
        </button>
        <button
          onClick={() => post("close", { reason: "false_alarm" })}
          disabled={!!busy}
          className="flex-1 rounded-xl border border-[var(--color-border)] px-4 py-3 font-semibold"
        >
          Falsa alarma
        </button>
      </div>
    </div>
  );
}

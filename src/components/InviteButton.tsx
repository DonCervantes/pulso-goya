"use client";

import { useState } from "react";

export default function InviteButton() {
  const [link, setLink] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    setCopied(false);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || undefined }),
      });
      const data = (await res.json()) as { token: string };
      setLink(`${window.location.origin}/invitacion/${data.token}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
      <h3 className="text-lg font-bold">Invitar a mi familia</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Genera un enlace para que un familiar se una a tu red de apoyo.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo del familiar (opcional)"
          className="flex-1 rounded-lg border border-[var(--color-border)] p-3"
        />
        <button
          onClick={generate}
          disabled={busy}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Generando…" : "Generar enlace"}
        </button>
      </div>

      {link && (
        <div className="mt-3 rounded-lg bg-[var(--color-background)] p-3">
          <p className="break-all text-sm">{link}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
            }}
            className="mt-2 rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]"
          >
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function AddToPhone() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    // ¿Ya está instalada / abierta como app?
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleAdd() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else {
      setShowSteps((s) => !s);
    }
  }

  if (installed) {
    return (
      <section className="rounded-2xl border border-[var(--color-success)] bg-[var(--color-surface)] p-5">
        <p className="font-semibold text-[var(--color-success)]">
          ✓ Pulso ya está en la pantalla de inicio de tu teléfono.
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Ábrela desde su ícono para pedir ayuda con un toque.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-3xl">📲</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold">Ten Pulso siempre a la mano</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Añade Pulso a la pantalla de inicio de tu teléfono para pedir ayuda con un solo toque,
            sin buscar el navegador.
          </p>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="mt-4 w-full rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white"
      >
        ➕ Añadir a mi teléfono
      </button>

      {showSteps && (
        <div className="mt-4 rounded-xl bg-[var(--color-background)] p-4 text-sm">
          <p className="font-semibold">En tu teléfono Android (Chrome):</p>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-[var(--color-text-secondary)]">
            <li>Toca el menú <strong>⋮</strong> (arriba a la derecha).</li>
            <li>Elige <strong>“Agregar a la pantalla principal”</strong> o <strong>“Instalar app”</strong>.</li>
            <li>Confirma con <strong>Agregar</strong>. Verás el ícono de Pulso en tu inicio.</li>
          </ol>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            ¿iPhone? En Safari toca <strong>Compartir</strong> → <strong>“Agregar a inicio”</strong>.
          </p>
        </div>
      )}
    </section>
  );
}

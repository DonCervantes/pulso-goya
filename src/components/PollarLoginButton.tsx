"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePollar } from "@pollar/react";

export default function PollarLoginButton() {
  const router = useRouter();
  const { openLoginModal, isAuthenticated, verified, wallet, getClient } = usePollar();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !verified || handledRef.current) return;
    handledRef.current = true;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const profile = getClient().getUserProfile();
        const walletAddress = wallet?.address ?? profile?.providers?.wallet?.address;
        if (!walletAddress) throw new Error("Sin dirección de wallet");
        const displayName = [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        const res = await fetch("/api/auth/pollar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress, email: profile?.mail, displayName }),
        });
        if (!res.ok) throw new Error("No se pudo crear la sesión");
        const data = (await res.json()) as { needsOnboarding: boolean };
        router.push(data.needsOnboarding ? "/onboarding" : "/inicio");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al iniciar sesión");
        handledRef.current = false;
        setBusy(false);
      }
    })();
  }, [isAuthenticated, verified, wallet, getClient, router]);

  return (
    <div>
      <button
        onClick={() => openLoginModal()}
        disabled={busy}
        className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Entrando…" : "Entrar con Pollar (correo)"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        Recibirás un código por correo. Se creará tu wallet automáticamente.
      </p>
    </div>
  );
}

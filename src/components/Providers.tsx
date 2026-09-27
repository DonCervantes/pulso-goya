"use client";

import { PollarProvider } from "@pollar/react";
import "@pollar/react/styles.css";

// Envuelve la app en PollarProvider SOLO si hay publishable key.
// Sin clave, la app corre con el login mock (sin montar Pollar).
const POLLAR_KEY = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY;

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!POLLAR_KEY) return <>{children}</>;
  return (
    <PollarProvider client={{ apiKey: POLLAR_KEY, stellarNetwork: "testnet" }}>
      {children}
    </PollarProvider>
  );
}

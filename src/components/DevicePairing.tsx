"use client";

import { useEffect, useRef, useState } from "react";
import { formatMx } from "@/lib/format";

type Phase = "idle" | "scanning" | "found" | "pairing" | "paired";
const STORAGE_KEY = "pulso_device";

interface PairedDevice {
  name: string;
  model: string;
  pairedAt: string;
}

export default function DevicePairing() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [device, setDevice] = useState<PairedDevice | null>(null);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDevice(JSON.parse(raw));
        setPhase("paired");
      }
    } catch {
      /* almacenamiento no disponible */
    }
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function scan() {
    setPhase("scanning");
    timers.current.push(setTimeout(() => setPhase("found"), 2200));
  }

  function pair() {
    setPhase("pairing");
    timers.current.push(
      setTimeout(() => {
        const d: PairedDevice = {
          name: "Pulso Collar",
          model: "ESP32-WROOM-32",
          pairedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        } catch {
          /* noop */
        }
        setDevice(d);
        setPhase("paired");
      }, 1600),
    );
  }

  function unpair() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setDevice(null);
    setPhase("idle");
    setTestMsg(null);
  }

  function testSignal() {
    setTestMsg("Enviando señal de prueba…");
    timers.current.push(
      setTimeout(
        () => setTestMsg("✓ Señal de prueba recibida por el collar. (Esto es una prueba)"),
        1200,
      ),
    );
  }

  const note = (
    <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
      Emparejamiento por Bluetooth. La conexión con el collar físico (ESP32) se completa en la etapa
      final del piloto.
    </p>
  );

  // ── Conectado ──
  if (phase === "paired" && device) {
    return (
      <section className="rounded-2xl border border-[var(--color-success)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-3xl">📿</span>
          <div className="flex-1">
            <p className="font-bold">
              {device.name} <span className="text-[var(--color-success)]">· Conectado</span>
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {device.model} · Bluetooth
            </p>
          </div>
          <span className="rounded-full bg-[var(--color-mint-soft)] px-2 py-1 text-xs font-semibold text-[var(--color-primary)]">
            🔋 87%
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-[var(--color-background)] p-3">
            <dt className="text-[var(--color-text-secondary)]">Señal</dt>
            <dd className="font-semibold">Buena</dd>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-3">
            <dt className="text-[var(--color-text-secondary)]">Vinculado</dt>
            <dd className="font-semibold">{formatMx(device.pairedAt)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={testSignal}
            className="flex-1 rounded-xl bg-[var(--color-primary)] px-4 py-3 font-semibold text-white"
          >
            Probar el botón del collar
          </button>
          <button
            onClick={unpair}
            className="rounded-xl border border-[var(--color-border)] px-4 py-3 font-semibold"
          >
            Desvincular
          </button>
        </div>

        {testMsg && (
          <p className="mt-3 rounded-lg bg-[var(--color-mint-soft)] p-3 text-sm text-[var(--color-primary)]">
            {testMsg}
          </p>
        )}
        {note}
      </section>
    );
  }

  // ── Buscando ──
  if (phase === "scanning") {
    return (
      <section className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5 text-center">
        <p className="text-lg font-bold">Buscando dispositivos Bluetooth…</p>
        <div className="mx-auto my-5 h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-mint-soft)] border-t-[var(--color-primary)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Asegúrate de que el collar esté encendido y cerca.
        </p>
      </section>
    );
  }

  // ── Encontrado ──
  if (phase === "found") {
    return (
      <section className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5">
        <p className="font-bold">Dispositivos encontrados</p>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border-soft)] p-4">
          <span aria-hidden className="text-2xl">📿</span>
          <div className="flex-1">
            <p className="font-semibold">Pulso Collar</p>
            <p className="text-sm text-[var(--color-text-secondary)]">ESP32-WROOM-32 · Bluetooth</p>
          </div>
          <button
            onClick={pair}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Emparejar
          </button>
        </div>
        {note}
      </section>
    );
  }

  // ── Emparejando ──
  if (phase === "pairing") {
    return (
      <section className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5 text-center">
        <p className="text-lg font-bold">Emparejando con Pulso Collar…</p>
        <div className="mx-auto my-5 h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-mint-soft)] border-t-[var(--color-primary)]" />
      </section>
    );
  }

  // ── Inicial ──
  return (
    <section className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-3xl">📿</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold">Vincula tu collar Pulso</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Conéctalo por Bluetooth para pedir ayuda con el botón físico del collar.
          </p>
        </div>
      </div>
      <button
        onClick={scan}
        className="mt-4 w-full rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white"
      >
        🔵 Buscar mi collar por Bluetooth
      </button>
      {note}
    </section>
  );
}

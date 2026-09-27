"use client";

import { useCallback, useEffect, useState } from "react";
import type { Place, PlaceType } from "@/lib/types";

const SECTIONS: { type: PlaceType; title: string; icon: string }[] = [
  { type: "pharmacy", title: "Farmacias cercanas", icon: "💊" },
  { type: "hospital", title: "Hospitales cercanos", icon: "🏥" },
  { type: "doctor", title: "Doctores", icon: "🩺" },
];

export default function NearbyPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [source, setSource] = useState<"seed" | "places" | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const load = useCallback(async (coords?: { lat: number; lng: number }) => {
    setBusy(true);
    try {
      const q = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
      const res = await fetch(`/api/places${q}`);
      const data = (await res.json()) as { source: "seed" | "places"; places: Place[] };
      setPlaces(data.places ?? []);
      setSource(data.source);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load(); // carga inicial (seed si no hay ubicación)
  }, [load]);

  function useMyLocation() {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Tu navegador no permite compartir ubicación.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => void load({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setGeoError("No se pudo obtener tu ubicación. Mostrando lugares de ejemplo.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {source === "places"
            ? "Lugares reales cercanos a tu ubicación."
            : "Lugares de ejemplo. Comparte tu ubicación para ver los cercanos reales."}
        </p>
        <button
          onClick={useMyLocation}
          disabled={busy}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Buscando…" : "📍 Usar mi ubicación"}
        </button>
      </div>

      {geoError && <p className="text-sm text-[var(--color-warning)]">{geoError}</p>}

      {SECTIONS.map((s) => {
        const items = places.filter((p) => p.type === s.type);
        return (
          <section key={s.type} className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5">
            <h3 className="text-lg font-bold">
              {s.icon} {s.title}
            </h3>
            <ul className="mt-3 flex flex-col gap-3">
              {items.length === 0 && (
                <li className="text-sm text-[var(--color-text-secondary)]">Sin resultados.</li>
              )}
              {items.map((p) => (
                <li key={p.id} className="border-b border-[var(--color-border-soft)] pb-2 last:border-0">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {p.address}
                    {p.zone ? ` · ${p.zone}` : ""}
                  </p>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="text-sm font-semibold text-[var(--color-primary)]">
                      📞 {p.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

interface Row {
  key: number;
  name: string;
  phone: string;
}

// Permite al usuario agregar sus propias ambulancias (nombre + teléfono).
// Los inputs se llaman customAmbName / customAmbPhone y forman parte del
// formulario de onboarding (server action los lee con getAll).
export default function CustomAmbulances() {
  const [rows, setRows] = useState<Row[]>([]);

  function add() {
    setRows((r) => [...r, { key: Date.now() + Math.random(), name: "", phone: "" }]);
  }
  function remove(key: number) {
    setRows((r) => r.filter((x) => x.key !== key));
  }
  function update(key: number, field: "name" | "phone", value: string) {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, [field]: value } : x)));
  }

  return (
    <div className="mt-3 border-t border-[var(--color-border-soft)] pt-3">
      <p className="text-sm font-medium">¿No está tu ambulancia? Agrégala:</p>

      {rows.map((row) => (
        <div key={row.key} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            name="customAmbName"
            value={row.name}
            onChange={(e) => update(row.key, "name", e.target.value)}
            placeholder="Nombre (ej. Ambulancias SUMMA)"
            className="flex-1 rounded-lg border border-[var(--color-border)] p-3"
          />
          <input
            name="customAmbPhone"
            value={row.phone}
            onChange={(e) => update(row.key, "phone", e.target.value)}
            placeholder="Teléfono"
            inputMode="tel"
            className="w-full rounded-lg border border-[var(--color-border)] p-3 sm:w-40"
          />
          <button
            type="button"
            onClick={() => remove(row.key)}
            aria-label="Quitar ambulancia"
            className="rounded-lg border border-[var(--color-border)] px-3 py-3 text-[var(--color-danger)]"
          >
            Quitar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]"
      >
        + Agregar mi ambulancia
      </button>
    </div>
  );
}

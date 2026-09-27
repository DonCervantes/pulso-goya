const TZ = "America/Mexico_City";

export function nowUtc(): string {
  return new Date().toISOString();
}

/** Día local (YYYY-MM-DD) en America/Mexico_City, para el chequeo diario. */
export function mexicoLocalDay(d: Date = new Date()): string {
  // en-CA da formato YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Fecha y hora legible en zona CDMX, con la zona visible. */
export function formatMx(iso: string): string {
  const d = new Date(iso);
  const s = new Intl.DateTimeFormat("es-MX", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
  return `${s} (CDMX)`;
}

/** Solo hora corta en zona CDMX. */
export function formatTimeMx(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

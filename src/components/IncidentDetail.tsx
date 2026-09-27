import { formatMx } from "@/lib/format";
import type { ChainAnchor, Incident, NotificationRecord } from "@/lib/types";

const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";
const ANCHOR_LABEL: Record<number, string> = {
  1: "Apertura",
  2: "Confirmación familiar",
  3: "Cierre",
  4: "Falsa alarma",
};

const STATUS_LABEL: Record<Incident["status"], string> = {
  created: "Alerta enviada",
  family_acknowledged: "Familiar confirmó",
  contacting: "Ayuda solicitada",
  resolved: "Cerrada (atendida)",
  false_alarm: "Cerrada (falsa alarma)",
};

const EVENT_LABEL: Record<string, string> = {
  opened: "Alerta creada",
  auth_notice_simulated: "Aviso a autoridades (SIMULADO)",
  notifications_sent: "Familiares notificados",
  family_acknowledged: "Familiar confirmó recepción",
  call_logged: "Llamada al 911 registrada",
  closed: "Caso cerrado",
};

export default function IncidentDetail({
  incident,
  notifications,
  userName,
  anchors = [],
}: {
  incident: Incident;
  notifications: NotificationRecord[];
  userName: string;
  anchors?: ChainAnchor[];
}) {
  const closed = incident.status === "resolved" || incident.status === "false_alarm";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">Incidente de {userName}</p>
        <h1 className="text-2xl font-extrabold">{STATUS_LABEL[incident.status]}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Abierto: {formatMx(incident.openedAt)}
        </p>
      </div>

      {/* Banner SIMULADO */}
      <div className="rounded-xl border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4 text-[var(--color-warning)]">
        <strong>⚠ Aviso a autoridades: SIMULADO.</strong> No se contactó a ninguna autoridad
        real. Si es una urgencia, alguien debe llamar al 911.
      </div>

      {/* Estado de notificaciones */}
      <section className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
        <h2 className="font-bold">Familiares</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {notifications.length === 0 && (
            <li className="text-[var(--color-text-secondary)]">Sin contactos configurados.</li>
          )}
          {notifications.map((n) => (
            <li key={n.id} className="flex justify-between">
              <span>{n.contactName}</span>
              <span
                className={
                  n.status === "sent" || n.status === "acknowledged"
                    ? "text-[var(--color-success)]"
                    : n.status === "failed"
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-text-secondary)]"
                }
              >
                {n.status === "sent"
                  ? "✓ correo enviado"
                  : n.status === "acknowledged"
                    ? "✓ confirmado"
                    : n.status === "failed"
                      ? "✕ falló"
                      : "en cola"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ambulancias preseleccionadas */}
      {incident.ambulanceSnapshot.length > 0 && (
        <section className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
          <h2 className="font-bold">Ambulancias que elegiste</h2>
          <div className="mt-2 flex flex-col gap-2">
            {incident.ambulanceSnapshot.map((a) => (
              <a
                key={a.id}
                href={`tel:${a.phone}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-primary)] px-4 py-3 font-semibold text-[var(--color-primary)]"
              >
                <span>📞 {a.name}</span>
                <span>{a.phone}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <a
        href="tel:911"
        className="rounded-xl bg-[var(--color-danger)] px-5 py-4 text-center text-lg font-semibold text-white"
      >
        📞 Llamar al 911
      </a>

      {/* Cronología */}
      <section className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
        <h2 className="font-bold">Cronología</h2>
        <ol className="mt-2 flex flex-col gap-2">
          {incident.events.map((e) => (
            <li key={e.seq} className="border-l-2 border-[var(--color-border-soft)] pl-3">
              <p className="text-sm font-medium">{EVENT_LABEL[e.type] ?? e.type}</p>
              {e.note && <p className="text-sm text-[var(--color-text-secondary)]">{e.note}</p>}
              <p className="text-xs text-[var(--color-text-secondary)]">{formatMx(e.at)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Constancia verificable en Stellar */}
      {anchors.length > 0 && (
        <section className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
          <h2 className="font-bold">Constancia en Stellar</h2>
          <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
            Registro verificable de la secuencia del incidente. No contiene datos personales.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {anchors.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2">
                <span>{ANCHOR_LABEL[a.eventCode] ?? `Evento ${a.eventCode}`}</span>
                {a.status === "confirmed" && a.txHash ? (
                  <a
                    className="font-semibold text-[var(--color-primary)] underline"
                    href={`https://stellar.expert/explorer/${STELLAR_NETWORK}/tx/${a.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ✓ ver en explorador
                  </a>
                ) : a.status === "failed" ? (
                  <span className="text-[var(--color-danger)]">✕ falló (se reintenta)</span>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">anclando…</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {closed && (
        <p className="rounded-lg bg-[var(--color-surface)] p-3 text-[var(--color-success)]">
          ✓ Este caso está cerrado.
        </p>
      )}
    </div>
  );
}

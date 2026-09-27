import {
  createChainAnchor,
  getChainAnchor,
  getIncident,
  updateChainAnchor,
} from "./store";
import { anchorEvent, isStellarConfigured } from "./stellar";
import { computeCommitmentHex, genNonceHex } from "./commitment";

// Orquesta el anclaje de un evento del incidente en Stellar.
// Best-effort e idempotente: nunca lanza (no debe romper el flujo de alertas),
// y no re-ancla un seq ya confirmado. Se ejecuta en segundo plano (after()).

type Phase = "opened" | "family_ack" | "closed" | "false_alarm";

const PHASE: Record<Phase, { seq: number; code: number }> = {
  opened: { seq: 1, code: 1 },
  family_ack: { seq: 2, code: 2 },
  closed: { seq: 3, code: 3 },
  false_alarm: { seq: 3, code: 4 },
};

export async function anchorIncidentPhase(incidentId: string, phase: Phase): Promise<void> {
  try {
    if (!isStellarConfigured()) return;
    const incident = await getIncident(incidentId);
    if (!incident?.caseKey) return;

    const { seq, code } = PHASE[phase];
    const existing = await getChainAnchor(incidentId, seq);
    if (existing && existing.status !== "failed") return; // ya anclado o en curso

    // En reintento de uno fallido, se reutilizan sus valores para que el
    // commitment en cadena siga correspondiendo al registro guardado.
    const ts = existing?.serverReceivedAtUnix ?? Math.floor(Date.now() / 1000);
    const nonce = existing?.nonce ?? genNonceHex();
    const commitment =
      existing?.commitment ??
      computeCommitmentHex({
        caseKeyHex: incident.caseKey,
        seq,
        eventCode: code,
        serverReceivedAtUnix: ts,
        canonicalRecord: `${incident.id}|${phase}`,
        nonceHex: nonce,
      });

    let anchorId = existing?.id;
    if (!existing) {
      const rec = await createChainAnchor({
        incidentId,
        caseKey: incident.caseKey,
        anchorSeq: seq,
        eventCode: code,
        commitment,
        nonce,
        serverReceivedAtUnix: ts,
        status: "pending",
      });
      anchorId = rec.id;
    }

    try {
      const { txHash, ledger } = await anchorEvent({
        caseKeyHex: incident.caseKey,
        seq,
        eventCode: code,
        serverReceivedAtUnix: ts,
        commitmentHex: commitment,
      });
      if (anchorId) await updateChainAnchor(anchorId, { status: "confirmed", txHash, ledger });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (anchorId) await updateChainAnchor(anchorId, { status: "failed", error: msg });
      console.error(`[anchor] falló ${incidentId} ${phase}:`, msg);
    }
  } catch (e) {
    console.error("[anchor] error inesperado:", e);
  }
}

import { createHash, randomBytes } from "crypto";

// Compromiso criptográfico para el anclaje en Stellar (docs §6.6).
// commitment = SHA-256(version || case_key || seq || event_code ||
//                       server_received_at_unix || registro_canonico || nonce)
// El nonce y el registro canónico permanecen FUERA de cadena.

export const COMMITMENT_VERSION = "pulso_anchor_v1";

export function genCaseKeyHex(): string {
  return randomBytes(32).toString("hex");
}
export function genNonceHex(): string {
  return randomBytes(32).toString("hex");
}

export function computeCommitmentHex(params: {
  caseKeyHex: string;
  seq: number;
  eventCode: number;
  serverReceivedAtUnix: number;
  canonicalRecord: string;
  nonceHex: string;
}): string {
  const h = createHash("sha256");
  h.update(COMMITMENT_VERSION);
  h.update("|");
  h.update(params.caseKeyHex);
  h.update("|");
  h.update(String(params.seq));
  h.update("|");
  h.update(String(params.eventCode));
  h.update("|");
  h.update(String(params.serverReceivedAtUnix));
  h.update("|");
  h.update(params.canonicalRecord);
  h.update("|");
  h.update(params.nonceHex);
  return h.digest("hex");
}

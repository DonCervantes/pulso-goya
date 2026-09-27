// Modelo de dominio de Pulso (v1 — mock). Mapea al modelo de datos de
// docs/PULSO_MASTER_SPEC.md §6.4. Cuando entre Supabase, estos tipos se
// conservan y solo cambia la implementación del store.

export type Role = "user" | "family" | "admin";

export interface User {
  id: string;
  role: Role;
  email: string;
  displayName: string;
  // Perfil (para rol "user")
  phone?: string;
  address?: string;
  zone?: string; // alcaldía / zona
  preferredAmbulanceIds?: string[];
  consentVersion?: string;
  createdAt: string;
  // Pollar
  walletAddress?: string;
  pollarSubject?: string;
  // Onboarding / KYC
  age?: number;
  bloodType?: string; // datos médicos sensibles (cifrar en v2)
  allergies?: string;
  conditions?: string;
  onboarded?: boolean;
}

export interface OnboardingInput {
  displayName: string;
  age?: number;
  zone?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  preferredAmbulanceIds: string[];
}

export interface Contact {
  id: string;
  userId: string; // usuario senior dueño del contacto
  name: string;
  email: string;
  relationship: string;
  verifiedAt?: string;
  // familiar ya registrado como User, si aceptó invitación
  linkedUserId?: string;
}

export interface FamilyInvite {
  id: string;
  userId: string;
  token: string;
  email?: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  expiresAt: string;
  acceptedBy?: string;
}

export type IncidentStatus =
  | "created"
  | "family_acknowledged"
  | "contacting"
  | "resolved"
  | "false_alarm";

export type IncidentEventType =
  | "opened"
  | "auth_notice_simulated"
  | "notifications_sent"
  | "family_acknowledged"
  | "call_logged"
  | "closed";

export interface IncidentEvent {
  seq: number;
  type: IncidentEventType;
  actorId?: string;
  at: string; // ISO UTC
  note?: string;
}

export interface Incident {
  id: string;
  userId: string;
  sourceChannel: "web" | "esp32";
  status: IncidentStatus;
  openedAt: string;
  closedAt?: string;
  closeReason?: string;
  clientEventId: string; // idempotencia
  caseKey?: string; // identificador aleatorio (hex) usado en Stellar
  events: IncidentEvent[];
  ambulanceSnapshot: AmbulanceNumber[];
}

// Anclaje de un evento del incidente en Stellar (constancia verificable).
export interface ChainAnchor {
  id: string;
  incidentId: string;
  caseKey: string;
  anchorSeq: number;
  eventCode: number; // 1=OPENED 2=FAMILY_ACK 3=CLOSED 4=FALSE_ALARM
  commitment: string;
  nonce: string; // fuera de cadena; permite recalcular el commitment en auditoría
  serverReceivedAtUnix: number;
  txHash?: string;
  ledger?: number;
  status: "pending" | "confirmed" | "failed";
  error?: string;
  createdAt: string;
}

export type NotificationStatus =
  | "queued"
  | "sent"
  | "failed"
  | "acknowledged";

export interface NotificationRecord {
  id: string;
  incidentId: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  channel: "email";
  status: NotificationStatus;
  attempts: number;
  providerId?: string;
  updatedAt: string;
}

export interface AmbulanceNumber {
  id: string;
  zone: string;
  name: string;
  phone: string;
  isPublic: boolean;
}

export type PlaceType = "pharmacy" | "hospital" | "doctor";

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
  address: string;
  phone?: string;
  zone: string;
  source: "seed" | "places";
}

// Chequeo diario — índice pulso_daily_v1
export type CheckinAnswer = 0 | 1 | 2 | 3 | 4 | null; // null = "No sé"

export interface DailyCheckin {
  id: string;
  userId: string;
  localDay: string; // YYYY-MM-DD en America/Mexico_City
  answers: {
    S1: CheckinAnswer;
    S2: CheckinAnswer;
    S3: CheckinAnswer;
    S4: CheckinAnswer;
    S5: CheckinAnswer;
  };
  wantsContact: boolean;
  alarmSignal: boolean; // respondió Sí / No estoy seguro a señales de alarma
  scoreVersion: string;
  score0to100: number | null; // null si incompleto
  completedAt: string;
}

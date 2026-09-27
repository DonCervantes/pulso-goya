import { randomUUID } from "crypto";
import { AMBULANCES, CONTACTS, PLACES, USERS } from "./seed";
import { SCORE_VERSION, computeScore } from "./score";
import { mexicoLocalDay, nowUtc } from "./format";
import { sendFamilyAlertEmail } from "./email";
import { genCaseKeyHex } from "./commitment";
import type {
  AmbulanceNumber,
  ChainAnchor,
  CheckinAnswer,
  Contact,
  DailyCheckin,
  FamilyInvite,
  Incident,
  IncidentEvent,
  NotificationRecord,
  Place,
  User,
} from "./types";

// ─────────────────────────────────────────────────────────────
// Implementación MOCK en memoria (v1, sin claves). Singleton en globalThis
// para sobrevivir el hot-reload de Next en dev. Se reinicia con la semilla.
// Misma firma (async) que la implementación de Supabase.
// ─────────────────────────────────────────────────────────────

interface DB {
  users: User[];
  contacts: Contact[];
  invites: FamilyInvite[];
  incidents: Incident[];
  notifications: NotificationRecord[];
  checkins: DailyCheckin[];
  places: Place[];
  ambulances: AmbulanceNumber[];
  chainAnchors: ChainAnchor[];
}

function seedDb(): DB {
  return {
    users: structuredClone(USERS),
    contacts: structuredClone(CONTACTS),
    invites: [],
    incidents: [],
    notifications: [],
    checkins: [],
    places: structuredClone(PLACES),
    ambulances: structuredClone(AMBULANCES),
    chainAnchors: [],
  };
}

const g = globalThis as unknown as { __pulsoDb?: DB };
if (!g.__pulsoDb) g.__pulsoDb = seedDb();
const db = g.__pulsoDb;

export async function getUser(id: string): Promise<User | undefined> {
  return db.users.find((u) => u.id === id);
}
export async function getUserByEmail(email: string): Promise<User | undefined> {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
export async function listUsers(): Promise<User[]> {
  return db.users;
}
export async function updateProfile(id: string, patch: Partial<User>): Promise<User | undefined> {
  const u = db.users.find((x) => x.id === id);
  if (!u) return undefined;
  Object.assign(u, patch);
  return u;
}

export async function upsertPollarUser(params: {
  walletAddress: string;
  email?: string;
  displayName?: string;
  pollarSubject?: string;
}): Promise<{ user: User; isNew: boolean }> {
  let u =
    db.users.find((x) => x.walletAddress === params.walletAddress) ??
    (params.email
      ? db.users.find((x) => x.email.toLowerCase() === params.email!.toLowerCase())
      : undefined);
  if (u) {
    u.walletAddress = params.walletAddress;
    if (params.pollarSubject) u.pollarSubject = params.pollarSubject;
    return { user: u, isNew: false };
  }
  u = {
    id: "u_" + randomUUID().slice(0, 8),
    role: "user",
    email: params.email ?? `${params.walletAddress.slice(0, 8)}@wallet.pulso`,
    displayName: params.displayName?.trim() || "Nuevo usuario",
    walletAddress: params.walletAddress,
    pollarSubject: params.pollarSubject,
    onboarded: false,
    createdAt: nowUtc(),
  };
  db.users.push(u);
  return { user: u, isNew: true };
}

export async function completeOnboarding(
  userId: string,
  input: {
    displayName: string;
    age?: number;
    zone?: string;
    phone?: string;
    address?: string;
    bloodType?: string;
    allergies?: string;
    conditions?: string;
    preferredAmbulanceIds: string[];
  },
): Promise<User | undefined> {
  const u = db.users.find((x) => x.id === userId);
  if (!u) return undefined;
  Object.assign(u, {
    displayName: input.displayName,
    age: input.age,
    zone: input.zone,
    phone: input.phone,
    address: input.address,
    bloodType: input.bloodType,
    allergies: input.allergies,
    conditions: input.conditions,
    preferredAmbulanceIds: input.preferredAmbulanceIds,
    consentVersion: "v1",
    onboarded: true,
  });
  return u;
}

export async function listContacts(userId: string): Promise<Contact[]> {
  return db.contacts.filter((c) => c.userId === userId);
}

export async function createInvite(userId: string, email?: string): Promise<FamilyInvite> {
  const now = Date.now();
  const invite: FamilyInvite = {
    id: randomUUID(),
    userId,
    token: randomUUID().replace(/-/g, ""),
    email,
    status: "pending",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 7 * 24 * 3600 * 1000).toISOString(),
  };
  db.invites.push(invite);
  return invite;
}

export async function getInvite(token: string): Promise<FamilyInvite | undefined> {
  const inv = db.invites.find((i) => i.token === token);
  if (inv && inv.status === "pending" && new Date(inv.expiresAt) < new Date()) {
    inv.status = "expired";
  }
  return inv;
}

export async function acceptInvite(
  token: string,
  familyEmail: string,
  displayName: string,
): Promise<User | undefined> {
  const inv = await getInvite(token);
  if (!inv || inv.status !== "pending") return undefined;
  let familyUser = await getUserByEmail(familyEmail);
  if (!familyUser) {
    familyUser = {
      id: "f_" + randomUUID().slice(0, 8),
      role: "family",
      email: familyEmail,
      displayName,
      createdAt: nowUtc(),
    };
    db.users.push(familyUser);
  }
  inv.status = "accepted";
  inv.acceptedBy = familyUser.id;
  db.contacts.push({
    id: randomUUID(),
    userId: inv.userId,
    name: displayName,
    email: familyEmail,
    relationship: "Familiar",
    verifiedAt: nowUtc(),
    linkedUserId: familyUser.id,
  });
  return familyUser;
}

export async function listPlaces(type?: Place["type"], zone?: string): Promise<Place[]> {
  return db.places.filter(
    (p) => (!type || p.type === type) && (!zone || p.zone === zone),
  );
}
export async function listAmbulances(zone = "CDMX"): Promise<AmbulanceNumber[]> {
  return db.ambulances.filter((a) => a.zone === zone || a.zone === "CDMX");
}
export async function getAmbulancesByIds(ids: string[]): Promise<AmbulanceNumber[]> {
  return db.ambulances.filter((a) => ids.includes(a.id));
}
export async function createAmbulance(input: {
  name: string;
  phone: string;
  zone?: string;
  isPublic?: boolean;
}): Promise<AmbulanceNumber> {
  const amb: AmbulanceNumber = {
    id: "amb_" + randomUUID().slice(0, 8),
    zone: input.zone ?? "CDMX",
    name: input.name,
    phone: input.phone,
    isPublic: input.isPublic ?? false,
  };
  db.ambulances.push(amb);
  return amb;
}

export async function listIncidents(): Promise<Incident[]> {
  return [...db.incidents].sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}
export async function getIncident(id: string): Promise<Incident | undefined> {
  return db.incidents.find((i) => i.id === id);
}
export async function listIncidentsForUser(userId: string): Promise<Incident[]> {
  return (await listIncidents()).filter((i) => i.userId === userId);
}
export async function listIncidentsForFamily(familyUserId: string): Promise<Incident[]> {
  const ownerIds = db.contacts
    .filter((c) => c.linkedUserId === familyUserId)
    .map((c) => c.userId);
  return (await listIncidents()).filter((i) => ownerIds.includes(i.userId));
}

export async function createIncident(
  userId: string,
  clientEventId: string,
  sourceChannel: "web" | "esp32" = "web",
): Promise<{ incident: Incident; duplicated: boolean }> {
  const existing = db.incidents.find((i) => i.clientEventId === clientEventId);
  if (existing) return { incident: existing, duplicated: true };

  const user = await getUser(userId);
  const ambulanceSnapshot = await getAmbulancesByIds(user?.preferredAmbulanceIds ?? []);

  const now = nowUtc();
  const events: IncidentEvent[] = [
    { seq: 1, type: "opened", at: now, actorId: userId },
    {
      seq: 2,
      type: "auth_notice_simulated",
      at: now,
      note: "Aviso a autoridades SIMULADO — no se contactó a ninguna autoridad real.",
    },
  ];

  const incident: Incident = {
    id: "inc_" + randomUUID().slice(0, 8),
    userId,
    sourceChannel,
    status: "created",
    openedAt: now,
    clientEventId,
    caseKey: genCaseKeyHex(),
    events,
    ambulanceSnapshot,
  };
  db.incidents.push(incident);

  const contacts = await listContacts(userId);
  for (const c of contacts) {
    const rec: NotificationRecord = {
      id: randomUUID(),
      incidentId: incident.id,
      contactId: c.id,
      contactName: c.name,
      contactEmail: c.email,
      channel: "email",
      status: "queued",
      attempts: 0,
      updatedAt: nowUtc(),
    };
    db.notifications.push(rec);
    try {
      const res = await sendFamilyAlertEmail({
        to: c.email,
        contactName: c.name,
        userName: user?.displayName ?? "un ser querido",
        incidentId: incident.id,
      });
      rec.status = "sent";
      rec.attempts = 1;
      rec.providerId = res.id;
    } catch {
      rec.status = "failed";
      rec.attempts = 1;
    }
    rec.updatedAt = nowUtc();
  }
  addEvent(incident, "notifications_sent", undefined, `${contacts.length} contacto(s) notificados`);

  return { incident, duplicated: false };
}

function addEvent(
  incident: Incident,
  type: IncidentEvent["type"],
  actorId?: string,
  note?: string,
) {
  const seq = incident.events.length + 1;
  incident.events.push({ seq, type, actorId, at: nowUtc(), note });
}

export async function listNotifications(incidentId: string): Promise<NotificationRecord[]> {
  return db.notifications.filter((n) => n.incidentId === incidentId);
}

export async function acknowledgeIncident(
  id: string,
  familyUserId: string,
): Promise<Incident | undefined> {
  const inc = await getIncident(id);
  if (!inc) return undefined;
  if (inc.status === "created") inc.status = "family_acknowledged";
  const already = inc.events.some(
    (e) => e.type === "family_acknowledged" && e.actorId === familyUserId,
  );
  if (!already) {
    const fam = await getUser(familyUserId);
    addEvent(inc, "family_acknowledged", familyUserId, `${fam?.displayName ?? "Familiar"} confirmó recepción`);
  }
  return inc;
}

export async function logCall(
  id: string,
  familyUserId: string,
  data: { result?: string; folio?: string },
): Promise<Incident | undefined> {
  const inc = await getIncident(id);
  if (!inc) return undefined;
  inc.status = "contacting";
  const parts = ["Llamada al 911 registrada"];
  if (data.result) parts.push(`resultado: ${data.result}`);
  if (data.folio) parts.push(`folio: ${data.folio}`);
  addEvent(inc, "call_logged", familyUserId, parts.join(" · "));
  return inc;
}

export async function closeIncident(
  id: string,
  actorId: string,
  reason: "resolved" | "false_alarm",
): Promise<Incident | undefined> {
  const inc = await getIncident(id);
  if (!inc) return undefined;
  inc.status = reason === "resolved" ? "resolved" : "false_alarm";
  inc.closedAt = nowUtc();
  inc.closeReason = reason;
  addEvent(inc, "closed", actorId, reason === "resolved" ? "Caso cerrado: atendido" : "Caso cerrado: falsa alarma");
  return inc;
}

export async function getTodayCheckin(userId: string): Promise<DailyCheckin | undefined> {
  const day = mexicoLocalDay();
  return db.checkins.find((c) => c.userId === userId && c.localDay === day);
}
export async function listCheckins(userId: string): Promise<DailyCheckin[]> {
  return db.checkins
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.localDay.localeCompare(a.localDay));
}

export async function saveCheckin(
  userId: string,
  input: {
    answers: { S1: CheckinAnswer; S2: CheckinAnswer; S3: CheckinAnswer; S4: CheckinAnswer; S5: CheckinAnswer };
    wantsContact: boolean;
    alarmSignal: boolean;
  },
): Promise<DailyCheckin> {
  const day = mexicoLocalDay();
  const score = computeScore(input.answers);
  const existing = await getTodayCheckin(userId);
  if (existing) {
    existing.answers = input.answers;
    existing.wantsContact = input.wantsContact;
    existing.alarmSignal = input.alarmSignal;
    existing.score0to100 = score;
    existing.completedAt = nowUtc();
    return existing;
  }
  const checkin: DailyCheckin = {
    id: randomUUID(),
    userId,
    localDay: day,
    answers: input.answers,
    wantsContact: input.wantsContact,
    alarmSignal: input.alarmSignal,
    scoreVersion: SCORE_VERSION,
    score0to100: score,
    completedAt: nowUtc(),
  };
  db.checkins.push(checkin);
  return checkin;
}

// ── Anclajes en Stellar ───────────────────────────────────────
export async function listChainAnchors(incidentId: string): Promise<ChainAnchor[]> {
  return db.chainAnchors
    .filter((a) => a.incidentId === incidentId)
    .sort((a, b) => a.anchorSeq - b.anchorSeq);
}
export async function getChainAnchor(
  incidentId: string,
  anchorSeq: number,
): Promise<ChainAnchor | undefined> {
  return db.chainAnchors.find((a) => a.incidentId === incidentId && a.anchorSeq === anchorSeq);
}
export async function createChainAnchor(a: Omit<ChainAnchor, "id" | "createdAt">): Promise<ChainAnchor> {
  const rec: ChainAnchor = { ...a, id: randomUUID(), createdAt: nowUtc() };
  db.chainAnchors.push(rec);
  return rec;
}
export async function updateChainAnchor(
  id: string,
  patch: Partial<ChainAnchor>,
): Promise<ChainAnchor | undefined> {
  const rec = db.chainAnchors.find((x) => x.id === id);
  if (!rec) return undefined;
  Object.assign(rec, patch);
  return rec;
}

export async function adminMetrics() {
  const incidents = db.incidents;
  const acked = incidents.filter((i) => i.events.some((e) => e.type === "family_acknowledged"));
  const completedCheckins = db.checkins.filter((c) => c.score0to100 !== null);
  const avgScore =
    completedCheckins.length > 0
      ? Math.round(
          completedCheckins.reduce((s, c) => s + (c.score0to100 ?? 0), 0) / completedCheckins.length,
        )
      : null;
  return {
    totalUsers: db.users.filter((u) => u.role === "user").length,
    totalFamily: db.users.filter((u) => u.role === "family").length,
    totalIncidents: incidents.length,
    openIncidents: incidents.filter((i) => i.status !== "resolved" && i.status !== "false_alarm").length,
    acknowledgedRate: incidents.length > 0 ? Math.round((acked.length / incidents.length) * 100) : 0,
    totalCheckins: db.checkins.length,
    avgWellbeingScore: avgScore,
  };
}

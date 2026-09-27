import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "./supabase";
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

// Implementación con Supabase (Postgres). Misma firma async que mock-store.
// El backend usa service role; RLS se endurece en v2 (ticket V07).

function sb() {
  const c = getSupabaseAdmin();
  if (!c) throw new Error("Supabase no configurado");
  return c;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function userFromRow(r: any): User {
  return {
    id: r.id,
    role: r.role,
    email: r.email,
    displayName: r.display_name,
    phone: r.phone ?? undefined,
    address: r.address ?? undefined,
    zone: r.zone ?? undefined,
    preferredAmbulanceIds: r.preferred_ambulance_ids ?? [],
    consentVersion: r.consent_version ?? undefined,
    createdAt: r.created_at,
    walletAddress: r.wallet_address ?? undefined,
    pollarSubject: r.pollar_subject ?? undefined,
    age: r.age ?? undefined,
    bloodType: r.blood_type ?? undefined,
    allergies: r.allergies ?? undefined,
    conditions: r.conditions ?? undefined,
    onboarded: r.onboarded ?? false,
  };
}
function contactFromRow(r: any): Contact {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    email: r.email,
    relationship: r.relationship ?? "",
    verifiedAt: r.verified_at ?? undefined,
    linkedUserId: r.linked_user_id ?? undefined,
  };
}
function inviteFromRow(r: any): FamilyInvite {
  return {
    id: r.id,
    userId: r.user_id,
    token: r.token,
    email: r.email ?? undefined,
    status: r.status,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    acceptedBy: r.accepted_by ?? undefined,
  };
}
function placeFromRow(r: any): Place {
  return { id: r.id, type: r.type, name: r.name, address: r.address, phone: r.phone ?? undefined, zone: r.zone, source: r.source };
}
function ambulanceFromRow(r: any): AmbulanceNumber {
  return { id: r.id, zone: r.zone, name: r.name, phone: r.phone, isPublic: r.is_public };
}
function eventFromRow(r: any): IncidentEvent {
  return { seq: r.seq, type: r.type, actorId: r.actor_id ?? undefined, at: r.at, note: r.note ?? undefined };
}
function notificationFromRow(r: any): NotificationRecord {
  return {
    id: r.id,
    incidentId: r.incident_id,
    contactId: r.contact_id,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    channel: r.channel,
    status: r.status,
    attempts: r.attempts,
    providerId: r.provider_id ?? undefined,
    updatedAt: r.updated_at,
  };
}
function incidentFromRow(r: any, events: IncidentEvent[]): Incident {
  return {
    id: r.id,
    userId: r.user_id,
    sourceChannel: r.source_channel,
    status: r.status,
    openedAt: r.opened_at,
    closedAt: r.closed_at ?? undefined,
    closeReason: r.close_reason ?? undefined,
    clientEventId: r.client_event_id,
    caseKey: r.case_key ?? undefined,
    events: events.sort((a, b) => a.seq - b.seq),
    ambulanceSnapshot: (r.ambulance_snapshot ?? []) as AmbulanceNumber[],
  };
}
function chainAnchorFromRow(r: any): ChainAnchor {
  return {
    id: r.id,
    incidentId: r.incident_id,
    caseKey: r.case_key,
    anchorSeq: r.anchor_seq,
    eventCode: r.event_code,
    commitment: r.commitment,
    nonce: r.nonce,
    serverReceivedAtUnix: Number(r.server_received_at_unix),
    txHash: r.tx_hash ?? undefined,
    ledger: r.ledger ?? undefined,
    status: r.status,
    error: r.error ?? undefined,
    createdAt: r.created_at,
  };
}
function checkinFromRow(r: any): DailyCheckin {
  return {
    id: r.id,
    userId: r.user_id,
    localDay: r.local_day,
    answers: r.answers,
    wantsContact: r.wants_contact,
    alarmSignal: r.alarm_signal,
    scoreVersion: r.score_version,
    score0to100: r.score_0_100 ?? null,
    completedAt: r.completed_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Usuarios ──
export async function getUser(id: string): Promise<User | undefined> {
  const { data } = await sb().from("users").select("*").eq("id", id).maybeSingle();
  return data ? userFromRow(data) : undefined;
}
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data } = await sb().from("users").select("*").ilike("email", email).maybeSingle();
  return data ? userFromRow(data) : undefined;
}
export async function listUsers(): Promise<User[]> {
  const { data } = await sb().from("users").select("*").order("created_at");
  return (data ?? []).map(userFromRow);
}
export async function updateProfile(id: string, patch: Partial<User>): Promise<User | undefined> {
  const row: Record<string, unknown> = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.zone !== undefined) row.zone = patch.zone;
  if (patch.preferredAmbulanceIds !== undefined) row.preferred_ambulance_ids = patch.preferredAmbulanceIds;
  const { data } = await sb().from("users").update(row).eq("id", id).select("*").maybeSingle();
  return data ? userFromRow(data) : undefined;
}

export async function upsertPollarUser(params: {
  walletAddress: string;
  email?: string;
  displayName?: string;
  pollarSubject?: string;
}): Promise<{ user: User; isNew: boolean }> {
  // Buscar por wallet primero, luego por correo.
  const byWallet = (await sb().from("users").select("*").eq("wallet_address", params.walletAddress).maybeSingle()).data;
  let existing = byWallet;
  if (!existing && params.email) {
    existing = (await sb().from("users").select("*").ilike("email", params.email).maybeSingle()).data;
  }
  if (existing) {
    const patch: Record<string, unknown> = { wallet_address: params.walletAddress };
    if (params.pollarSubject) patch.pollar_subject = params.pollarSubject;
    const { data } = await sb().from("users").update(patch).eq("id", existing.id).select("*").single();
    return { user: userFromRow(data), isNew: false };
  }
  const id = "u_" + randomUUID().slice(0, 8);
  const { data } = await sb()
    .from("users")
    .insert({
      id,
      role: "user",
      email: params.email ?? `${params.walletAddress.slice(0, 8)}@wallet.pulso`,
      display_name: params.displayName?.trim() || "Nuevo usuario",
      wallet_address: params.walletAddress,
      pollar_subject: params.pollarSubject ?? null,
      onboarded: false,
    })
    .select("*")
    .single();
  return { user: userFromRow(data), isNew: true };
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
  const { data } = await sb()
    .from("users")
    .update({
      display_name: input.displayName,
      age: input.age ?? null,
      zone: input.zone ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      blood_type: input.bloodType ?? null,
      allergies: input.allergies ?? null,
      conditions: input.conditions ?? null,
      preferred_ambulance_ids: input.preferredAmbulanceIds,
      consent_version: "v1",
      onboarded: true,
    })
    .eq("id", userId)
    .select("*")
    .maybeSingle();
  return data ? userFromRow(data) : undefined;
}

// ── Contactos ──
export async function listContacts(userId: string): Promise<Contact[]> {
  const { data } = await sb().from("contacts").select("*").eq("user_id", userId);
  return (data ?? []).map(contactFromRow);
}

// ── Invitaciones ──
export async function createInvite(userId: string, email?: string): Promise<FamilyInvite> {
  const now = Date.now();
  const row = {
    user_id: userId,
    token: randomUUID().replace(/-/g, ""),
    email: email ?? null,
    status: "pending",
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + 7 * 24 * 3600 * 1000).toISOString(),
  };
  const { data, error } = await sb().from("family_invites").insert(row).select("*").single();
  if (error) throw error;
  return inviteFromRow(data);
}
export async function getInvite(token: string): Promise<FamilyInvite | undefined> {
  const { data } = await sb().from("family_invites").select("*").eq("token", token).maybeSingle();
  if (!data) return undefined;
  if (data.status === "pending" && new Date(data.expires_at) < new Date()) {
    await sb().from("family_invites").update({ status: "expired" }).eq("token", token);
    data.status = "expired";
  }
  return inviteFromRow(data);
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
    const id = "f_" + randomUUID().slice(0, 8);
    const { data } = await sb()
      .from("users")
      .insert({ id, role: "family", email: familyEmail, display_name: displayName })
      .select("*")
      .single();
    familyUser = userFromRow(data);
  }
  await sb().from("family_invites").update({ status: "accepted", accepted_by: familyUser.id }).eq("token", token);
  await sb().from("contacts").insert({
    user_id: inv.userId,
    name: displayName,
    email: familyEmail,
    relationship: "Familiar",
    verified_at: nowUtc(),
    linked_user_id: familyUser.id,
  });
  return familyUser;
}

// ── Lugares / ambulancias ──
export async function listPlaces(type?: Place["type"], zone?: string): Promise<Place[]> {
  let q = sb().from("places").select("*");
  if (type) q = q.eq("type", type);
  if (zone) q = q.eq("zone", zone);
  const { data } = await q;
  return (data ?? []).map(placeFromRow);
}
export async function listAmbulances(zone = "CDMX"): Promise<AmbulanceNumber[]> {
  const { data } = await sb().from("ambulance_numbers").select("*").in("zone", [zone, "CDMX"]);
  return (data ?? []).map(ambulanceFromRow);
}
export async function getAmbulancesByIds(ids: string[]): Promise<AmbulanceNumber[]> {
  if (ids.length === 0) return [];
  const { data } = await sb().from("ambulance_numbers").select("*").in("id", ids);
  return (data ?? []).map(ambulanceFromRow);
}
export async function createAmbulance(input: {
  name: string;
  phone: string;
  zone?: string;
  isPublic?: boolean;
}): Promise<AmbulanceNumber> {
  const id = "amb_" + randomUUID().slice(0, 8);
  const { data } = await sb()
    .from("ambulance_numbers")
    .insert({
      id,
      zone: input.zone ?? "CDMX",
      name: input.name,
      phone: input.phone,
      is_public: input.isPublic ?? false,
    })
    .select("*")
    .single();
  return ambulanceFromRow(data);
}

// ── Incidentes ──
async function attachEvents(rows: any[]): Promise<Incident[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const { data: evs } = await sb().from("incident_events").select("*").in("incident_id", ids);
  const byIncident = new Map<string, IncidentEvent[]>();
  for (const e of evs ?? []) {
    const list = byIncident.get(e.incident_id) ?? [];
    list.push(eventFromRow(e));
    byIncident.set(e.incident_id, list);
  }
  return rows.map((r) => incidentFromRow(r, byIncident.get(r.id) ?? []));
}

export async function listIncidents(): Promise<Incident[]> {
  const { data } = await sb().from("incidents").select("*").order("opened_at", { ascending: false });
  return attachEvents(data ?? []);
}
export async function getIncident(id: string): Promise<Incident | undefined> {
  const { data } = await sb().from("incidents").select("*").eq("id", id).maybeSingle();
  if (!data) return undefined;
  const { data: evs } = await sb().from("incident_events").select("*").eq("incident_id", id);
  return incidentFromRow(data, (evs ?? []).map(eventFromRow));
}
export async function listIncidentsForUser(userId: string): Promise<Incident[]> {
  const { data } = await sb()
    .from("incidents")
    .select("*")
    .eq("user_id", userId)
    .order("opened_at", { ascending: false });
  return attachEvents(data ?? []);
}
export async function listIncidentsForFamily(familyUserId: string): Promise<Incident[]> {
  const { data: contacts } = await sb().from("contacts").select("user_id").eq("linked_user_id", familyUserId);
  const ownerIds = [...new Set((contacts ?? []).map((c) => c.user_id))];
  if (ownerIds.length === 0) return [];
  const { data } = await sb()
    .from("incidents")
    .select("*")
    .in("user_id", ownerIds)
    .order("opened_at", { ascending: false });
  return attachEvents(data ?? []);
}

async function insertEvent(incidentId: string, type: string, actorId?: string, note?: string) {
  const { data } = await sb()
    .from("incident_events")
    .select("seq")
    .eq("incident_id", incidentId)
    .order("seq", { ascending: false })
    .limit(1);
  const nextSeq = (data?.[0]?.seq ?? 0) + 1;
  await sb().from("incident_events").insert({
    incident_id: incidentId,
    seq: nextSeq,
    type,
    actor_id: actorId ?? null,
    at: nowUtc(),
    note: note ?? null,
  });
}

export async function createIncident(
  userId: string,
  clientEventId: string,
  sourceChannel: "web" | "esp32" = "web",
): Promise<{ incident: Incident; duplicated: boolean }> {
  const { data: existing } = await sb()
    .from("incidents")
    .select("*")
    .eq("client_event_id", clientEventId)
    .maybeSingle();
  if (existing) {
    const inc = await getIncident(existing.id);
    return { incident: inc!, duplicated: true };
  }

  const user = await getUser(userId);
  const ambulanceSnapshot = await getAmbulancesByIds(user?.preferredAmbulanceIds ?? []);
  const id = "inc_" + randomUUID().slice(0, 8);
  const now = nowUtc();

  const { error } = await sb().from("incidents").insert({
    id,
    user_id: userId,
    source_channel: sourceChannel,
    status: "created",
    opened_at: now,
    client_event_id: clientEventId,
    case_key: genCaseKeyHex(),
    ambulance_snapshot: ambulanceSnapshot,
  });
  if (error) {
    // Posible carrera por unique(client_event_id): re-leer.
    const inc = (await sb().from("incidents").select("*").eq("client_event_id", clientEventId).maybeSingle()).data;
    if (inc) return { incident: (await getIncident(inc.id))!, duplicated: true };
    throw error;
  }

  await sb().from("incident_events").insert([
    { incident_id: id, seq: 1, type: "opened", actor_id: userId, at: now },
    { incident_id: id, seq: 2, type: "auth_notice_simulated", at: now, note: "Aviso a autoridades SIMULADO — no se contactó a ninguna autoridad real." },
  ]);

  const contacts = await listContacts(userId);
  for (const c of contacts) {
    const base = {
      incident_id: id,
      contact_id: c.id,
      contact_name: c.name,
      contact_email: c.email,
      channel: "email",
      attempts: 0,
      updated_at: nowUtc(),
    };
    let status = "failed";
    let providerId: string | null = null;
    let attempts = 1;
    try {
      const res = await sendFamilyAlertEmail({
        to: c.email,
        contactName: c.name,
        userName: user?.displayName ?? "un ser querido",
        incidentId: id,
      });
      status = "sent";
      providerId = res.id;
    } catch {
      status = "failed";
    }
    await sb().from("notifications").insert({ ...base, status, attempts, provider_id: providerId, updated_at: nowUtc() });
  }
  await insertEvent(id, "notifications_sent", undefined, `${contacts.length} contacto(s) notificados`);

  const incident = await getIncident(id);
  return { incident: incident!, duplicated: false };
}

export async function listNotifications(incidentId: string): Promise<NotificationRecord[]> {
  const { data } = await sb().from("notifications").select("*").eq("incident_id", incidentId);
  return (data ?? []).map(notificationFromRow);
}

export async function acknowledgeIncident(id: string, familyUserId: string): Promise<Incident | undefined> {
  const inc = await getIncident(id);
  if (!inc) return undefined;
  if (inc.status === "created") {
    await sb().from("incidents").update({ status: "family_acknowledged" }).eq("id", id);
  }
  const already = inc.events.some((e) => e.type === "family_acknowledged" && e.actorId === familyUserId);
  if (!already) {
    const fam = await getUser(familyUserId);
    await insertEvent(id, "family_acknowledged", familyUserId, `${fam?.displayName ?? "Familiar"} confirmó recepción`);
  }
  return getIncident(id);
}

export async function logCall(
  id: string,
  familyUserId: string,
  data: { result?: string; folio?: string },
): Promise<Incident | undefined> {
  const inc = await getIncident(id);
  if (!inc) return undefined;
  await sb().from("incidents").update({ status: "contacting" }).eq("id", id);
  const parts = ["Llamada al 911 registrada"];
  if (data.result) parts.push(`resultado: ${data.result}`);
  if (data.folio) parts.push(`folio: ${data.folio}`);
  await insertEvent(id, "call_logged", familyUserId, parts.join(" · "));
  return getIncident(id);
}

export async function closeIncident(
  id: string,
  actorId: string,
  reason: "resolved" | "false_alarm",
): Promise<Incident | undefined> {
  const inc = await getIncident(id);
  if (!inc) return undefined;
  await sb().from("incidents").update({
    status: reason === "resolved" ? "resolved" : "false_alarm",
    closed_at: nowUtc(),
    close_reason: reason,
  }).eq("id", id);
  await insertEvent(id, "closed", actorId, reason === "resolved" ? "Caso cerrado: atendido" : "Caso cerrado: falsa alarma");
  return getIncident(id);
}

// ── Chequeo diario ──
export async function getTodayCheckin(userId: string): Promise<DailyCheckin | undefined> {
  const day = mexicoLocalDay();
  const { data } = await sb()
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("local_day", day)
    .maybeSingle();
  return data ? checkinFromRow(data) : undefined;
}
export async function listCheckins(userId: string): Promise<DailyCheckin[]> {
  const { data } = await sb()
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("local_day", { ascending: false });
  return (data ?? []).map(checkinFromRow);
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
  const row = {
    user_id: userId,
    local_day: day,
    answers: input.answers,
    wants_contact: input.wantsContact,
    alarm_signal: input.alarmSignal,
    score_version: SCORE_VERSION,
    score_0_100: score,
    completed_at: nowUtc(),
  };
  const { data } = await sb()
    .from("daily_checkins")
    .upsert(row, { onConflict: "user_id,local_day" })
    .select("*")
    .single();
  return checkinFromRow(data);
}

// ── Anclajes en Stellar ──
export async function listChainAnchors(incidentId: string): Promise<ChainAnchor[]> {
  const { data } = await sb()
    .from("chain_anchors")
    .select("*")
    .eq("incident_id", incidentId)
    .order("anchor_seq");
  return (data ?? []).map(chainAnchorFromRow);
}
export async function getChainAnchor(
  incidentId: string,
  anchorSeq: number,
): Promise<ChainAnchor | undefined> {
  const { data } = await sb()
    .from("chain_anchors")
    .select("*")
    .eq("incident_id", incidentId)
    .eq("anchor_seq", anchorSeq)
    .maybeSingle();
  return data ? chainAnchorFromRow(data) : undefined;
}
export async function createChainAnchor(
  a: Omit<ChainAnchor, "id" | "createdAt">,
): Promise<ChainAnchor> {
  const { data } = await sb()
    .from("chain_anchors")
    .insert({
      incident_id: a.incidentId,
      case_key: a.caseKey,
      anchor_seq: a.anchorSeq,
      event_code: a.eventCode,
      commitment: a.commitment,
      nonce: a.nonce,
      server_received_at_unix: a.serverReceivedAtUnix,
      tx_hash: a.txHash ?? null,
      ledger: a.ledger ?? null,
      status: a.status,
      error: a.error ?? null,
    })
    .select("*")
    .single();
  return chainAnchorFromRow(data);
}
export async function updateChainAnchor(
  id: string,
  patch: Partial<ChainAnchor>,
): Promise<ChainAnchor | undefined> {
  const row: Record<string, unknown> = {};
  if (patch.txHash !== undefined) row.tx_hash = patch.txHash;
  if (patch.ledger !== undefined) row.ledger = patch.ledger;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.error !== undefined) row.error = patch.error;
  const { data } = await sb().from("chain_anchors").update(row).eq("id", id).select("*").maybeSingle();
  return data ? chainAnchorFromRow(data) : undefined;
}

// ── Métricas ──
export async function adminMetrics() {
  const [{ data: users }, { data: incidents }, { data: checkins }, { data: ackEvents }] = await Promise.all([
    sb().from("users").select("role"),
    sb().from("incidents").select("id,status"),
    sb().from("daily_checkins").select("score_0_100"),
    sb().from("incident_events").select("incident_id").eq("type", "family_acknowledged"),
  ]);
  const incs = incidents ?? [];
  const ackedIds = new Set((ackEvents ?? []).map((e) => e.incident_id));
  const completed = (checkins ?? []).filter((c) => c.score_0_100 !== null);
  const avg =
    completed.length > 0
      ? Math.round(completed.reduce((s, c) => s + (c.score_0_100 ?? 0), 0) / completed.length)
      : null;
  return {
    totalUsers: (users ?? []).filter((u) => u.role === "user").length,
    totalFamily: (users ?? []).filter((u) => u.role === "family").length,
    totalIncidents: incs.length,
    openIncidents: incs.filter((i) => i.status !== "resolved" && i.status !== "false_alarm").length,
    acknowledgedRate: incs.length > 0 ? Math.round((ackedIds.size / incs.length) * 100) : 0,
    totalCheckins: (checkins ?? []).length,
    avgWellbeingScore: avg,
  };
}

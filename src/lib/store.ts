// Despachador de la capa de datos. Si Supabase está configurado
// (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY), usa Postgres;
// de lo contrario, usa el store mock en memoria. Todos los métodos son async
// y comparten firma, así que la UI no cambia al alternar backend.

import { isSupabaseConfigured } from "./supabase";
import * as mock from "./mock-store";
import * as supa from "./supabase-store";

const impl = isSupabaseConfigured() ? supa : mock;

export const getUser = impl.getUser;
export const getUserByEmail = impl.getUserByEmail;
export const listUsers = impl.listUsers;
export const updateProfile = impl.updateProfile;
export const upsertPollarUser = impl.upsertPollarUser;
export const completeOnboarding = impl.completeOnboarding;

export const listContacts = impl.listContacts;
export const createInvite = impl.createInvite;
export const getInvite = impl.getInvite;
export const acceptInvite = impl.acceptInvite;

export const listPlaces = impl.listPlaces;
export const listAmbulances = impl.listAmbulances;
export const getAmbulancesByIds = impl.getAmbulancesByIds;
export const createAmbulance = impl.createAmbulance;

export const listIncidents = impl.listIncidents;
export const getIncident = impl.getIncident;
export const listIncidentsForUser = impl.listIncidentsForUser;
export const listIncidentsForFamily = impl.listIncidentsForFamily;
export const createIncident = impl.createIncident;
export const listNotifications = impl.listNotifications;
export const acknowledgeIncident = impl.acknowledgeIncident;
export const logCall = impl.logCall;
export const closeIncident = impl.closeIncident;

export const listChainAnchors = impl.listChainAnchors;
export const getChainAnchor = impl.getChainAnchor;
export const createChainAnchor = impl.createChainAnchor;
export const updateChainAnchor = impl.updateChainAnchor;

export const getTodayCheckin = impl.getTodayCheckin;
export const listCheckins = impl.listCheckins;
export const saveCheckin = impl.saveCheckin;

export const adminMetrics = impl.adminMetrics;

export const dataBackend: "supabase" | "mock" = isSupabaseConfigured() ? "supabase" : "mock";

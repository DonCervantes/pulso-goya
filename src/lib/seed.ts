import type {
  AmbulanceNumber,
  Contact,
  Place,
  User,
} from "./types";

// Datos semilla mock (v1). Reemplazables por Supabase + Google Places (v2).
// Números de ambulancia son de ejemplo para la demo; editar por alcaldía real.

export const AMBULANCES: AmbulanceNumber[] = [
  { id: "amb_cruzroja", zone: "CDMX", name: "Cruz Roja Mexicana", phone: "065", isPublic: true },
  { id: "amb_erum", zone: "CDMX", name: "ERUM (SSC) / 911", phone: "911", isPublic: true },
  { id: "amb_locatel", zone: "CDMX", name: "Locatel", phone: "5556581111", isPublic: true },
  { id: "amb_privada", zone: "CDMX", name: "Ambulancia privada (ejemplo)", phone: "5500000000", isPublic: false },
];

export const PLACES: Place[] = [
  { id: "ph1", type: "pharmacy", name: "Farmacia del Ahorro — Roma", address: "Av. Álvaro Obregón 100, Roma Nte.", phone: "5552000000", zone: "Cuauhtémoc", source: "seed" },
  { id: "ph2", type: "pharmacy", name: "Farmacias Guadalajara — Condesa", address: "Av. Tamaulipas 55, Condesa", phone: "5552000001", zone: "Cuauhtémoc", source: "seed" },
  { id: "ph3", type: "pharmacy", name: "Farmacia San Pablo — Del Valle", address: "Av. Coyoacán 300, Del Valle", phone: "5552000002", zone: "Benito Juárez", source: "seed" },
  { id: "ho1", type: "hospital", name: "Hospital General de México", address: "Dr. Balmis 148, Doctores", phone: "5527892000", zone: "Cuauhtémoc", source: "seed" },
  { id: "ho2", type: "hospital", name: "IMSS — Clínica 25", address: "Av. Universidad 500, Narvarte", phone: "5555550000", zone: "Benito Juárez", source: "seed" },
  { id: "ho3", type: "hospital", name: "Cruz Roja — Polanco", address: "Av. Ejército Nacional 1032, Polanco", phone: "5553951111", zone: "Miguel Hidalgo", source: "seed" },
  { id: "dr1", type: "doctor", name: "Dra. María López — Medicina interna", address: "Consultorio, Roma Nte.", phone: "5551110000", zone: "Cuauhtémoc", source: "seed" },
  { id: "dr2", type: "doctor", name: "Dr. Jorge Díaz — Cardiología", address: "Consultorio, Del Valle", phone: "5551110001", zone: "Benito Juárez", source: "seed" },
];

export const USERS: User[] = [
  {
    id: "u_ana",
    role: "user",
    email: "ana@ejemplo.mx",
    displayName: "Ana (usuaria demo)",
    phone: "5551234567",
    address: "Calle Ejemplo 123, Roma Nte., Cuauhtémoc",
    zone: "Cuauhtémoc",
    preferredAmbulanceIds: ["amb_cruzroja", "amb_erum"],
    consentVersion: "v1",
    onboarded: true,
    createdAt: new Date("2026-09-20T10:00:00Z").toISOString(),
  },
  {
    id: "f_luis",
    role: "family",
    email: "luis@ejemplo.mx",
    displayName: "Luis (familiar demo)",
    onboarded: true,
    createdAt: new Date("2026-09-20T11:00:00Z").toISOString(),
  },
];

export const CONTACTS: Contact[] = [
  {
    id: "c_luis",
    userId: "u_ana",
    name: "Luis (hijo)",
    email: "luis@ejemplo.mx",
    relationship: "Hijo",
    verifiedAt: new Date("2026-09-20T11:05:00Z").toISOString(),
    linkedUserId: "f_luis",
  },
  {
    id: "c_rosa",
    userId: "u_ana",
    name: "Rosa (vecina)",
    email: "rosa@ejemplo.mx",
    relationship: "Vecina",
    verifiedAt: new Date("2026-09-21T09:00:00Z").toISOString(),
  },
];

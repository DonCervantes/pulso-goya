import type { Place, PlaceType } from "./types";

// Dataset mock de lugares de CDMX con coordenadas. Permite simular "cercanía"
// (distancia real desde la ubicación del usuario) sin depender de Google Places.

const MOCK: Place[] = [
  // Farmacias
  { id: "mp_ph1", type: "pharmacy", name: "Farmacia del Ahorro — Roma", address: "Av. Álvaro Obregón 100, Roma Nte.", phone: "5552000000", zone: "Cuauhtémoc", source: "seed", lat: 19.4196, lng: -99.1625 },
  { id: "mp_ph2", type: "pharmacy", name: "Farmacias Guadalajara — Condesa", address: "Av. Tamaulipas 55, Condesa", phone: "5552000001", zone: "Cuauhtémoc", source: "seed", lat: 19.4110, lng: -99.1710 },
  { id: "mp_ph3", type: "pharmacy", name: "Farmacia San Pablo — Del Valle", address: "Av. Coyoacán 300, Del Valle", phone: "5552000002", zone: "Benito Juárez", source: "seed", lat: 19.3860, lng: -99.1640 },
  { id: "mp_ph4", type: "pharmacy", name: "Farmacia Benavides — Polanco", address: "Av. Presidente Masaryk 200, Polanco", phone: "5552000003", zone: "Miguel Hidalgo", source: "seed", lat: 19.4330, lng: -99.1960 },
  { id: "mp_ph5", type: "pharmacy", name: "Farmacia Similares — Coyoacán", address: "Av. Universidad 1500, Coyoacán", phone: "5552000004", zone: "Coyoacán", source: "seed", lat: 19.3500, lng: -99.1620 },
  { id: "mp_ph6", type: "pharmacy", name: "Farmacia del Ahorro — Narvarte", address: "Av. Cuauhtémoc 900, Narvarte", phone: "5552000005", zone: "Benito Juárez", source: "seed", lat: 19.3950, lng: -99.1550 },
  // Hospitales
  { id: "mp_ho1", type: "hospital", name: "Hospital General de México", address: "Dr. Balmis 148, Doctores", phone: "5527892000", zone: "Cuauhtémoc", source: "seed", lat: 19.4140, lng: -99.1500 },
  { id: "mp_ho2", type: "hospital", name: "IMSS — Hospital La Raza", address: "Calz. Vallejo, La Raza", phone: "5557245900", zone: "Azcapotzalco", source: "seed", lat: 19.4720, lng: -99.1400 },
  { id: "mp_ho3", type: "hospital", name: "Cruz Roja — Polanco", address: "Av. Ejército Nacional 1032, Polanco", phone: "5553951111", zone: "Miguel Hidalgo", source: "seed", lat: 19.4400, lng: -99.2010 },
  { id: "mp_ho4", type: "hospital", name: "Hospital Ángeles — Roma", address: "Querétaro 58, Roma Nte.", phone: "5555840000", zone: "Cuauhtémoc", source: "seed", lat: 19.4090, lng: -99.1580 },
  { id: "mp_ho5", type: "hospital", name: "Médica Sur — Tlalpan", address: "Puente de Piedra 150, Toriello Guerra", phone: "5554240000", zone: "Tlalpan", source: "seed", lat: 19.2950, lng: -99.1620 },
  { id: "mp_ho6", type: "hospital", name: "INCMNSZ — Tlalpan", address: "Av. Vasco de Quiroga 15, Belisario Domínguez", phone: "5554870900", zone: "Tlalpan", source: "seed", lat: 19.2890, lng: -99.1710 },
  // Doctores
  { id: "mp_dr1", type: "doctor", name: "Dra. María López — Medicina interna", address: "Consultorio, Roma Nte.", phone: "5551110000", zone: "Cuauhtémoc", source: "seed", lat: 19.4180, lng: -99.1600 },
  { id: "mp_dr2", type: "doctor", name: "Dr. Jorge Díaz — Cardiología", address: "Consultorio, Del Valle", phone: "5551110001", zone: "Benito Juárez", source: "seed", lat: 19.3880, lng: -99.1660 },
  { id: "mp_dr3", type: "doctor", name: "Dra. Ana Ruiz — Geriatría", address: "Consultorio, Condesa", phone: "5551110002", zone: "Cuauhtémoc", source: "seed", lat: 19.4120, lng: -99.1740 },
  { id: "mp_dr4", type: "doctor", name: "Dr. Luis Marín — Medicina familiar", address: "Consultorio, Narvarte", phone: "5551110003", zone: "Benito Juárez", source: "seed", lat: 19.3960, lng: -99.1560 },
  { id: "mp_dr5", type: "doctor", name: "Dra. Sofía Cruz — Endocrinología", address: "Consultorio, Polanco", phone: "5551110004", zone: "Miguel Hidalgo", source: "seed", lat: 19.4320, lng: -99.1930 },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Lugares mock. Si se pasa la ubicación del usuario, calcula la distancia y
 * ordena por cercanía (simula "lugares cercanos" sin Google Places).
 */
export function nearbyMock(
  types: PlaceType[],
  coords?: { lat: number; lng: number },
): Place[] {
  let items = MOCK.filter((p) => types.includes(p.type));
  if (coords) {
    items = items
      .map((p) => ({
        ...p,
        distanceKm:
          p.lat != null && p.lng != null
            ? Math.round(haversineKm(coords.lat, coords.lng, p.lat, p.lng) * 10) / 10
            : undefined,
      }))
      .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }
  return items;
}

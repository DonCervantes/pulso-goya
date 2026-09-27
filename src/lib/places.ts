import type { Place, PlaceType } from "./types";

// Google Places API (New) — búsqueda de lugares cercanos.
// Si no hay GOOGLE_PLACES_API_KEY o no hay ubicación, el llamador usa el seed.

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

export function isPlacesConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

// Nuestros tipos → tipos de la Places API (New)
const TYPE_MAP: Record<PlaceType, string> = {
  pharmacy: "pharmacy",
  hospital: "hospital",
  doctor: "doctor",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function searchNearby(params: {
  type: PlaceType;
  lat: number;
  lng: number;
  radiusMeters?: number;
}): Promise<Place[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("Google Places no configurado");

  const res = await fetch(PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.location",
    },
    body: JSON.stringify({
      includedTypes: [TYPE_MAP[params.type]],
      maxResultCount: 10,
      languageCode: "es",
      regionCode: "MX",
      locationRestriction: {
        circle: {
          center: { latitude: params.lat, longitude: params.lng },
          radius: params.radiusMeters ?? 3000,
        },
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Google Places ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { places?: any[] };
  return (data.places ?? []).map((p) => ({
    id: p.id,
    type: params.type,
    name: p.displayName?.text ?? "Lugar",
    address: p.formattedAddress ?? "",
    phone: p.nationalPhoneNumber ?? undefined,
    zone: "",
    source: "places" as const,
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

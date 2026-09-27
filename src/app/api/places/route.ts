import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPlacesConfigured, searchNearby } from "@/lib/places";
import { nearbyMock } from "@/lib/mock-places";
import type { PlaceType } from "@/lib/types";

const VALID: PlaceType[] = ["pharmacy", "hospital", "doctor"];

// GET /api/places?type=pharmacy&lat=..&lng=..
// Con key + coordenadas usa Google Places; si no, devuelve el seed (mock).
export async function GET(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as PlaceType | null;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const types = type && VALID.includes(type) ? [type] : VALID;

  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if (isPlacesConfigured() && hasCoords) {
    try {
      const results = await Promise.all(
        types.map((t) => searchNearby({ type: t, lat, lng })),
      );
      return NextResponse.json({ source: "places", places: results.flat() });
    } catch (e) {
      // Si Places falla, degradamos al mock en vez de romper.
      console.error("[places] fallo, uso mock:", e instanceof Error ? e.message : e);
    }
  }

  // Mock: con coordenadas calcula distancia y ordena por cercanía.
  const places = nearbyMock(types, hasCoords ? { lat, lng } : undefined);
  return NextResponse.json({ source: "mock", places });
}

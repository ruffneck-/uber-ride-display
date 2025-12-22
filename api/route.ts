import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Decode Google encoded polyline into [lng,lat] coordinates.
 * Returns GeoJSON LineString coordinates.
 */
function decodePolyline(encoded: string): [number, number][] {
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coords: [number, number][] = [];

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coords.push([lng / 1e5, lat / 1e5]); // [lng,lat]
  }

  return coords;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (safe even though same-origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { oLat, oLng, dLat, dLng } = req.query as Record<string, string>;
    if (!oLat || !oLng || !dLat || !dLng) {
      return res.status(400).json({ ok: false, error: "Missing query params" });
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: "Missing GOOGLE_MAPS_API_KEY env var" });

    const url =
      "https://maps.googleapis.com/maps/api/directions/json" +
      `?origin=${oLat},${oLng}` +
      `&destination=${dLat},${dLng}` +
      `&mode=driving` +
      `&departure_time=now` +
      `&units=imperial` +
      `&key=${encodeURIComponent(key)}`;

    const r = await fetch(url);
    const data = await r.json();

    const route = data?.routes?.[0];
    const poly = route?.overview_polyline?.points;

    if (!poly) {
      return res.status(200).json({ ok: false, data });
    }

    const coords = decodePolyline(poly);

    return res.status(200).json({
      ok: true,
      geojson: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords },
      },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Server error" });
  }
}

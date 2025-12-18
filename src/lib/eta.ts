import type { LatLng } from "../types";

export type EtaResult = {
  distanceText: string;
  durationText: string;
  durationSeconds: number;
};

export async function fetchEta(origin: LatLng, destination: LatLng): Promise<EtaResult | null> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  if (!key) return null;

  const url =
    "https://maps.googleapis.com/maps/api/distancematrix/json" +
    `?origins=${origin.lat},${origin.lng}` +
    `&destinations=${destination.lat},${destination.lng}` +
    `&departure_time=now` +
    `&key=${encodeURIComponent(key)}`;

  // NOTE: Browser CORS can block this endpoint in some setups.
  // If it does, we’ll swap to a tiny Firebase Function proxy in 10 minutes.
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const el = data?.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK") return null;

  const duration = el.duration_in_traffic ?? el.duration;
  return {
    distanceText: el.distance?.text ?? "",
    durationText: duration?.text ?? "",
    durationSeconds: duration?.value ?? 0,
  };
}

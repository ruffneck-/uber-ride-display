import type { LatLng } from "../types";

export type EtaResult = {
  distanceText: string;
  durationText: string;
  durationSeconds: number;
};

export async function fetchEta(origin: LatLng, destination: LatLng): Promise<EtaResult | null> {
  const url =
    `/api/eta?oLat=${origin.lat}&oLng=${origin.lng}` +
    `&dLat=${destination.lat}&dLng=${destination.lng}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.ok) return null;

  return {
    distanceText: data.distanceText,
    durationText: data.durationText,
    durationSeconds: data.durationSeconds,
  };
}

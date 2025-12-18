import type { LatLng } from "../types";

export type EtaResult = {
  distanceText: string;
  durationText: string;
  durationSeconds: number;
};

export async function fetchEta(origin: LatLng, destination: LatLng): Promise<EtaResult | null> {
  const proxy = import.meta.env.VITE_ETA_PROXY_URL as string;
  if (!proxy) return null;

  const url =
    `${proxy}?oLat=${origin.lat}&oLng=${origin.lng}` +
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

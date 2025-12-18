import type { LatLng } from "./types";

export type DestinationPreset = {
  id: string;
  name: string;
  destination: LatLng;
};

export const PRESETS: DestinationPreset[] = [
  { id: "dia", name: "Denver Int’l Airport (DIA)", destination: { lat: 39.8561, lng: -104.6737 } },
  { id: "union", name: "Union Station", destination: { lat: 39.7527, lng: -104.9992 } },
  { id: "ball", name: "Ball Arena", destination: { lat: 39.7487, lng: -105.0077 } },
  { id: "downtown", name: "Downtown Denver (Civic Center)", destination: { lat: 39.7392, lng: -104.9903 } },
];

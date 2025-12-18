export type LatLng = { lat: number; lng: number };

export type Telemetry = LatLng & {
  speedMps?: number;
  heading?: number;
  ts: number;
};

export type SessionDoc = {
  code: string;
  active: boolean;
  destinationName?: string;
  destination?: LatLng;
  last?: Telemetry;
  createdAt: number;
  updatedAt: number;
};

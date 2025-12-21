import Map, { Marker, type MapRef } from "react-map-gl";
import maplibregl from "maplibre-gl";
import type { LatLng } from "../types";
import { useEffect, useMemo, useRef, useState } from "react";

const OSM_RASTER_STYLE: any = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

function clampHeading(deg?: number): number {
  if (typeof deg !== "number" || Number.isNaN(deg)) return 0;
  const v = deg % 360;
  return v < 0 ? v + 360 : v;
}

function CarArrow({ heading }: { heading?: number }) {
  const rot = clampHeading(heading);
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
        borderBottom: "18px solid dodgerblue",
        transform: `rotate(${rot}deg)`,
        transformOrigin: "50% 60%",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
      }}
      title={`Heading ${Math.round(rot)}°`}
    />
  );
}

function useSmoothedBearing(targetBearing: number, enabled: boolean) {
  const [bearing, setBearing] = useState(targetBearing);
  useEffect(() => {
    if (!enabled) {
      setBearing(targetBearing);
      return;
    }
    // Smooth bearing transitions: avoid 359 -> 0 jump the long way
    setBearing((prev) => {
      const a = ((prev % 360) + 360) % 360;
      const b = ((targetBearing % 360) + 360) % 360;
      let delta = b - a;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      return a + delta;
    });
  }, [targetBearing, enabled]);
  return bearing;
}

export default function LiveMap({
  current,
  destination,
  heading,
  follow = true,
}: {
  current: LatLng;
  destination?: LatLng;
  heading?: number;
  follow?: boolean;
}) {
  const mapRef = useRef<MapRef | null>(null);

  // Keep a stable zoom and pitch; we’ll animate center/bearing.
  const zoom = 14;
  const pitch = 45;

  const targetBearing = useMemo(() => clampHeading(heading), [heading]);
  const smoothedBearing = useSmoothedBearing(targetBearing, follow);

  // When GPS updates and follow=true, smoothly move camera.
  useEffect(() => {
    if (!follow) return;
    const m = mapRef.current;
    if (!m) return;

    // easeTo gives that “nav camera” feel
    m.easeTo({
      center: [current.lng, current.lat],
      bearing: smoothedBearing,
      pitch,
      zoom,
      duration: 650,
      essential: true,
    });
  }, [current.lat, current.lng, follow, smoothedBearing]);

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid #eee" }}>
      <Map
        ref={mapRef}
        mapLib={maplibregl as any}
        mapStyle={OSM_RASTER_STYLE}
        initialViewState={{
          longitude: current.lng,
          latitude: current.lat,
          zoom,
          pitch,
          bearing: smoothedBearing,
        }}
        style={{ width: "100%", height: "100%" }}
        // When follow is on, prevent passengers from messing with it
        dragPan={!follow}
        scrollZoom={!follow}
        doubleClickZoom={!follow}
        touchZoomRotate={!follow}
        attributionControl={false}
      >
        {/* Car */}
        <Marker longitude={current.lng} latitude={current.lat} anchor="center">
          <CarArrow heading={heading} />
        </Marker>

        {/* Destination */}
        {destination && (
          <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <div style={{ fontSize: 26, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))", userSelect: "none" }}>
              📍
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}

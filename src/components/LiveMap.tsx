import Map, { Marker } from "react-map-gl";
import maplibregl from "maplibre-gl";
import type { LatLng } from "../types";

const STYLE = "https://demotiles.maplibre.org/style.json";

function clampHeading(deg?: number): number {
  if (typeof deg !== "number" || Number.isNaN(deg)) return 0;
  const v = deg % 360;
  return v < 0 ? v + 360 : v;
}

/**
 * A simple triangular "car" arrow that we rotate by GPS heading.
 * Heading convention: 0° = North, 90° = East.
 */
function CarArrow({ heading }: { heading?: number }) {
  const rot = clampHeading(heading);

  return (
    <div
      aria-label="car-heading"
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
  // react-map-gl expects longitude/latitude numbers
  const longitude = current.lng;
  const latitude = current.lat;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #eee",
      }}
    >
      <Map
        mapLib={maplibregl as any}
        mapStyle={STYLE}
        // initial camera
        initialViewState={{
          longitude,
          latitude,
          zoom: 13.8,
        }}
        // "follow" mode: keep camera centered on current location
        // (we disable drag pan so passengers can't accidentally move it)
        longitude={follow ? longitude : undefined}
        latitude={follow ? latitude : undefined}
        zoom={13.8}
        style={{ width: "100%", height: "100%" }}
        dragPan={!follow}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate
        // keep it simple/stable for Vercel builds
        attributionControl={false}
      >
        {/* Current position marker */}
        <Marker longitude={longitude} latitude={latitude} anchor="center">
          <CarArrow heading={heading} />
        </Marker>

        {/* Destination marker */}
        {destination && (
          <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <div
              style={{
                fontSize: 26,
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
                userSelect: "none",
              }}
              aria-label="destination"
              title="Destination"
            >
              📍
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}

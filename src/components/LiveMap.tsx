import Map, { Marker } from "react-map-gl";
import type { LatLng } from "../types";

const STYLE = "https://demotiles.maplibre.org/style.json";

function clampHeading(deg?: number) {
  if (typeof deg !== "number" || Number.isNaN(deg)) return 0;
  const v = deg % 360;
  return v < 0 ? v + 360 : v;
}

function CarArrow({ heading }: { heading?: number }) {
  const rot = clampHeading(heading);
  // simple triangular arrow
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
  const view = {
    longitude: current.lng,
    latitude: current.lat,
    zoom: 13.8,
  };

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid #eee" }}>
      <Map
        mapLib={import("maplibre-gl")}
        mapStyle={STYLE}
        initialViewState={view}
        // when follow is on, keep the map centered on the car
        longitude={follow ? current.lng : undefined}
        latitude={follow ? current.lat : undefined}
        zoom={13.8}
        style={{ width: "100%", height: "100%" }}
        dragPan={!follow}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate
      >
        <Marker longitude={current.lng} latitude={current.lat} anchor="center">
          <CarArrow heading={heading} />
        </Marker>

        {destination && (
          <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <div style={{ fontSize: 26, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))" }}>📍</div>
          </Marker>
        )}
      </Map>
    </div>
  );
}

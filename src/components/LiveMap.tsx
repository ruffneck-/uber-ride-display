import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLng } from "../types";
import { useEffect } from "react";

function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);
  return null;
}

export default function LiveMap({
  current,
  destination,
  follow = true,
}: {
  current: LatLng;
  destination?: LatLng;
  follow?: boolean;
}) {
  return (
    <div style={{ height: "100%", width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid #eee" }}>
      <MapContainer center={[current.lat, current.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {follow && <Recenter center={current} />}

        <Marker position={[current.lat, current.lng]}>
          <Popup>Current location</Popup>
        </Marker>

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

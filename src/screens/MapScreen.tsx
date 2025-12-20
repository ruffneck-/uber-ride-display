import type { SessionDoc } from "../types";
import LiveMap from "../components/LiveMap";

export default function MapScreen({ session }: { session: SessionDoc | null }) {
  const last = session?.last;
  const dest = session?.destination;

  if (!last) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center", border: "1px solid #eee", borderRadius: 16 }}>
        <div style={{ opacity: 0.75 }}>Waiting for GPS…</div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <LiveMap current={{ lat: last.lat, lng: last.lng }} destination={dest} follow />
    </div>
  );
}

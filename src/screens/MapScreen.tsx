import { useEffect, useState } from "react";
import type { SessionDoc } from "../types";
import LiveMap from "../components/LiveMap";

export default function MapScreen({ session }: { session: SessionDoc | null }) {
  const last = session?.last;
  const dest = session?.destination;

  const [routeGeojson, setRouteGeojson] = useState<any>(null);

  useEffect(() => {
    let aborted = false;

    async function loadRoute() {
      setRouteGeojson(null);

      if (!session?.active) return;
      if (!last || !dest) return;

      const url =
        `/api/route?oLat=${last.lat}&oLng=${last.lng}` +
        `&dLat=${dest.lat}&dLng=${dest.lng}`;

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      if (aborted) return;

      if (data?.ok && data.geojson) setRouteGeojson(data.geojson);
    }

    loadRoute();
    return () => {
      aborted = true;
    };
  }, [session?.active, dest?.lat, dest?.lng]); // fetch once per destination

  if (!last) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center", border: "1px solid #eee", borderRadius: 16 }}>
        <div style={{ opacity: 0.75 }}>Waiting for GPS…</div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <LiveMap
        current={{ lat: last.lat, lng: last.lng }}
        destination={dest}
        heading={last.heading}
        follow
        routeGeojson={routeGeojson}
      />
    </div>
  );
}

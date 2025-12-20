import { useEffect, useMemo, useState } from "react";
import { ensureAnonAuth } from "../firebase";
import { subscribeSession } from "../lib/session";
import type { SessionDoc } from "../types";
import { fetchEta } from "../lib/eta";
import TipScreen from "../screens/TipScreen";
import FunFactScreen from "../screens/FunFactScreen";
import StatusScreen from "../screens/StatusScreen";
import MapScreen from "../screens/MapScreen";


type ScreenKey = "status" | "map" | "fact" | "tips";

export default function Display() {
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState<string>("");
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [screen, setScreen] = useState<ScreenKey>("status");
  const [eta, setEta] = useState<{ durationText: string; distanceText: string } | null>(null);

  useEffect(() => {
    ensureAnonAuth().catch(() => {});
  }, []);

  // Subscribe to session
  useEffect(() => {
    if (!code) return;
    const unsub = subscribeSession(code, setSession);
    return () => unsub();
  }, [code]);

  // Rotate screens
  useEffect(() => {
    const order: ScreenKey[] = ["status", "map", "fact", "tips"];
    const ms = 12000; // 12s each
    const t = setInterval(() => {
      setScreen((prev) => {
        const i = order.indexOf(prev);
        return order[(i + 1) % order.length];
      });
    }, ms);
    return () => clearInterval(t);
  }, []);

  // Poll ETA every 10s when active and we have origin+destination
  useEffect(() => {
    let timer: number | undefined;
    async function tick() {
      if (!session?.active) return;
      if (!session.last || !session.destination) return;
      const r = await fetchEta({ lat: session.last.lat, lng: session.last.lng }, session.destination);
      if (r) setEta({ durationText: r.durationText, distanceText: r.distanceText });
    }
    tick();
    timer = window.setInterval(tick, 10000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [session?.active, session?.last?.lat, session?.last?.lng, session?.destination?.lat, session?.destination?.lng]);

  const header = useMemo(() => {
    const title = session?.destinationName ?? "Waiting for destination…";
    const ride = session?.active ? "Ride in progress" : "Not active";
    const etaLine = eta ? `${eta.durationText} • ${eta.distanceText}` : "ETA loading…";
    return { title, ride, etaLine };
  }, [session?.destinationName, session?.active, eta]);

  if (!code) {
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
        <div style={{ width: 520, maxWidth: "92vw", padding: 18, border: "1px solid #ddd", borderRadius: 16 }}>
          <h2 style={{ marginTop: 0 }}>Passenger Display</h2>
          <p style={{ opacity: 0.8 }}>Enter the 6-digit pairing code from your phone.</p>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            style={{ fontSize: 28, padding: 12, width: "100%", letterSpacing: 4 }}
          />
          <button
            onClick={() => setCode(codeInput)}
            disabled={codeInput.length !== 6}
            style={{ marginTop: 12, padding: "12px 16px", width: "100%" }}
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", fontFamily: "system-ui", padding: 18, boxSizing: "border-box" }}>
      <div style={{ padding: 14, border: "1px solid #ddd", borderRadius: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{header.title}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6, opacity: 0.85 }}>
          <div>{header.ride}</div>
          <div>•</div>
          <div>{header.etaLine}</div>
        </div>
      </div>

      <div style={{ height: "calc(100% - 110px)" }}>
        {screen === "status" && <StatusScreen session={session} eta={eta} />}
        {screen === "fact" && <FunFactScreen />}
        {screen === "tips" && <TipScreen />}
        {screen === "map" && <MapScreen session={session} />}
      </div>
    </div>
  );
}

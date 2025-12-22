import { useEffect, useMemo, useState } from "react";
import { ensureAnonAuth } from "../firebase";
import { subscribeSession } from "../lib/session";
import type { SessionDoc } from "../types";
import { fetchEta } from "../lib/eta";

import StatusScreen from "../screens/StatusScreen";
import FunFactScreen from "../screens/FunFactScreen";
import TipScreen from "../screens/TipScreen";
import MapScreen from "../screens/MapScreen";

type ScreenKey = "status" | "map" | "fact" | "tips";

/* helpers */
function mpsToMph(mps?: number) {
  if (typeof mps !== "number" || Number.isNaN(mps)) return null;
  return mps * 2.2369362920544;
}
function headingToCardinal(deg?: number) {
  if (typeof deg !== "number" || Number.isNaN(deg)) return null;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return dirs[idx];
}
function secondsAgo(ts?: number) {
  if (!ts) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 1000));
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="pill">
      <span className="label">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export default function Display() {
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState<string>("");
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [screen, setScreen] = useState<ScreenKey>("status");
  const [eta, setEta] = useState<{ durationText: string; distanceText: string } | null>(null);

  useEffect(() => {
    ensureAnonAuth().catch(() => {});
  }, []);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeSession(code, setSession);
    return () => unsub();
  }, [code]);

  useEffect(() => {
    const order: ScreenKey[] = ["status", "map", "fact", "tips"];
    const ms = 12000;
    const t = setInterval(() => {
      setScreen((prev) => {
        const i = order.indexOf(prev);
        return order[(i + 1) % order.length];
      });
    }, ms);
    return () => clearInterval(t);
  }, []);

useEffect(() => {
  let timer: number | undefined;

  async function tick() {
    if (!session?.active) return;
    if (!session.last || !session.destination) return;

    const r = await fetchEta(
      { lat: session.last.lat, lng: session.last.lng },
      session.destination
    );

    if (r) setEta({ durationText: r.durationText, distanceText: r.distanceText });
  }

  tick();
  timer = window.setInterval(tick, 10000);

  return () => {
    if (timer !== undefined) {
      window.clearInterval(timer);
    }
  };
}, [
  session?.active,
  session?.last?.lat,
  session?.last?.lng,
  session?.destination?.lat,
  session?.destination?.lng,
]);
  const header = useMemo(() => {
    const title = session?.destinationName ?? "Waiting for destination…";
    const ride = session?.active ? "Ride in progress" : "Not active";

    const last = session?.last;
    const mphVal = mpsToMph(last?.speedMps);
    const mphText = mphVal == null ? "—" : `${Math.max(0, Math.round(mphVal))} mph`;

    const card = headingToCardinal(last?.heading);
    const headText = card ?? "—";

    const ago = secondsAgo(last?.ts);
    const agoText = ago == null ? "—" : ago <= 2 ? "just now" : `${ago}s ago`;

    const etaText = eta?.durationText ?? "—";
    const distText = eta?.distanceText ?? "—";

    return { title, ride, mphText, headText, agoText, etaText, distText };
  }, [session, eta]);

  /* Pairing */
  if (!code) {
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center", padding: 18 }}>
        <div className="card" style={{ width: 560, maxWidth: "94vw", padding: 18 }}>
          <div className="h1">Passenger Display</div>
          <div className="sub" style={{ marginTop: 8 }}>
            Enter the <b>6-digit</b> pairing code from the driver phone.
          </div>

          <div style={{ marginTop: 14 }}>
            <input
              className="input"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => setCode(codeInput)} disabled={codeInput.length !== 6}>
              Connect
            </button>
          </div>

          <div className="sub" style={{ marginTop: 12, fontSize: 12 }}>
            Tip: bookmark this page on the tablet for one-tap launch.
          </div>
        </div>
      </div>
    );
  }

  /* Main */
  return (
    <div style={{ height: "100vh", padding: 16, display: "grid", gridTemplateRows: "auto 1fr", gap: 14 }}>
      {/* Header */}
      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="h1">{header.title}</div>
            <div className="sub" style={{ marginTop: 4 }}>{header.ride}</div>
          </div>

          <button className="btn" style={{ width: 140 }} onClick={() => setCode("")}>
            Change code
          </button>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <Pill label="ETA" value={header.etaText} />
          <Pill label="Miles" value={header.distText} />
          <Pill label="Speed" value={header.mphText} />
          <Pill label="Heading" value={header.headText} />
          <Pill label="Updated" value={header.agoText} />
          <Pill label="Screen" value={screen.toUpperCase()} />
        </div>
      </div>

      {/* Body */}
      <div className="card soft" style={{ padding: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 16, overflow: "hidden" }}>
          {screen === "status" && <StatusScreen session={session} eta={eta} />}
          {screen === "map" && <MapScreen session={session} />}
          {screen === "fact" && <FunFactScreen />}
          {screen === "tips" && <TipScreen />}
        </div>
      </div>
    </div>
  );
}

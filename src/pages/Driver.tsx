import { useEffect, useMemo, useRef, useState } from "react";
import { ensureAnonAuth } from "../firebase";
import { PRESETS } from "../presets";
import { createSession, generateCode, pushTelemetry, readSession, setActive, setDestination } from "../lib/session";
import type { SessionDoc } from "../types";

function formatStatus(s: SessionDoc | null) {
  if (!s) return "No session";
  if (!s.destinationName) return "Select a destination";
  return s.active ? "Ride ACTIVE (streaming GPS)" : "Ready (tap Start ride)";
}

export default function Driver() {
  const [code, setCode] = useState<string>("");
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [geoErr, setGeoErr] = useState<string>("");
  const [streaming, setStreaming] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const createdCode = useMemo(() => generateCode(), []);

  useEffect(() => {
    ensureAnonAuth().catch(() => {});
  }, []);

  async function handleCreate() {
    const c = createdCode;
    setCode(c);
    const s = await createSession(c);
    setSession(s);
  }

  async function refresh() {
    if (!code) return;
    const s = await readSession(code);
    setSession(s);
  }

  async function startRide() {
    if (!code) return;
    setGeoErr("");
    await setActive(code, true);
    setStreaming(true);

    if (!navigator.geolocation) {
      setGeoErr("Geolocation not supported in this browser.");
      return;
    }

    // Stream GPS updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        await pushTelemetry(code, {
          lat: latitude,
          lng: longitude,
          speedMps: speed ?? undefined,
          heading: heading ?? undefined,
          ts: Date.now(),
        });
        // pull latest session occasionally
        if (!session?.active) refresh();
      },
      (err) => setGeoErr(err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  }

  async function stopRide() {
    if (!code) return;
    await setActive(code, false);
    setStreaming(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    await refresh();
  }

  async function choosePreset(id: string) {
    if (!code) return;
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    await setDestination(code, preset.name, preset.destination);
    await refresh();
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h2>Driver Control</h2>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={handleCreate} style={{ padding: "10px 14px" }}>
            Create Session
          </button>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Pairing Code</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>{code || "— — — — — —"}</div>
          </div>
          <button onClick={refresh} disabled={!code} style={{ padding: "10px 14px" }}>
            Refresh
          </button>
        </div>

        <div style={{ marginTop: 10, opacity: 0.8 }}>{formatStatus(session)}</div>
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12, marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Destination Presets</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => choosePreset(p.id)} disabled={!code} style={{ padding: "12px 14px", textAlign: "left" }}>
              {p.name}
            </button>
          ))}
        </div>
        {!code && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Create a session first.</div>}
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Ride Control</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={startRide} disabled={!code || streaming} style={{ padding: "12px 16px" }}>
            Start ride (stream GPS)
          </button>
          <button onClick={stopRide} disabled={!code || !streaming} style={{ padding: "12px 16px" }}>
            Stop ride
          </button>
        </div>
        {geoErr && <div style={{ marginTop: 10, color: "crimson" }}>{geoErr}</div>}
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Tip: keep this tab open on your phone during the ride so GPS updates continue.
        </div>
      </div>
    </div>
  );
}

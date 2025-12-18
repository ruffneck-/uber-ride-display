import type { SessionDoc } from "../types";

export default function StatusScreen({
  session,
  eta,
}: {
  session: SessionDoc | null;
  eta: { durationText: string; distanceText: string } | null;
}) {
  const last = session?.last;
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", border: "1px solid #eee", borderRadius: 16 }}>
      <div style={{ textAlign: "center", padding: 18 }}>
        <div style={{ fontSize: 44, fontWeight: 800 }}>
          {eta?.durationText ?? "—"} <span style={{ fontSize: 24, fontWeight: 600, opacity: 0.7 }}>ETA</span>
        </div>
        <div style={{ fontSize: 22, opacity: 0.8, marginTop: 6 }}>{eta?.distanceText ?? ""}</div>

        <div style={{ marginTop: 18, fontSize: 16, opacity: 0.75 }}>
          {session?.active ? "We’re on the way — thanks for riding!" : "Waiting to start…"}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
          Last update: {last ? new Date(last.ts).toLocaleTimeString() : "—"}
        </div>
      </div>
    </div>
  );
}

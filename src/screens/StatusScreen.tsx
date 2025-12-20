import type { SessionDoc } from "../types";

function mpsToMph(mps?: number) {
  if (typeof mps !== "number" || Number.isNaN(mps)) return null;
  return mps * 2.2369362920544;
}

function headingToCardinal(deg?: number) {
  if (typeof deg !== "number" || Number.isNaN(deg)) return null;
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return dirs[idx];
}

export default function StatusScreen({
  session,
  eta,
}: {
  session: SessionDoc | null;
  eta: { durationText: string; distanceText: string } | null;
}) {
  const last = session?.last;

  const mph = mpsToMph(last?.speedMps);
  const mphText = mph == null ? "—" : `${Math.max(0, Math.round(mph))} mph`;

  const card = headingToCardinal(last?.heading);
  const headingText =
    card && typeof last?.heading === "number"
      ? `${card} (${Math.round(last.heading)}°)`
      : "—";

  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", border: "1px solid #eee", borderRadius: 16 }}>
      <div style={{ textAlign: "center", padding: 18 }}>
        <div style={{ fontSize: 44, fontWeight: 800 }}>
          {eta?.durationText ?? "—"} <span style={{ fontSize: 24, fontWeight: 600, opacity: 0.7 }}>ETA</span>
        </div>
        <div style={{ fontSize: 22, opacity: 0.8, marginTop: 6 }}>{eta?.distanceText ?? ""}</div>

        <div style={{ marginTop: 18, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{mphText}</div>
          <div style={{ opacity: 0.4 }}>•</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{headingText}</div>
        </div>

        <div style={{ marginTop: 16, fontSize: 16, opacity: 0.75 }}>
          {session?.active ? "We’re on the way — thanks for riding!" : "Waiting to start…"}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
          Last update: {last ? new Date(last.ts).toLocaleTimeString() : "—"}
        </div>
      </div>
    </div>
  );
}

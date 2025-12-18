import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (so your /display can call it)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { oLat, oLng, dLat, dLng } = req.query as Record<string, string>;
    if (!oLat || !oLng || !dLat || !dLng) {
      return res.status(400).json({ ok: false, error: "Missing query params" });
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      return res.status(500).json({ ok: false, error: "Missing GOOGLE_MAPS_API_KEY env var" });
    }

    const url =
      "https://maps.googleapis.com/maps/api/distancematrix/json" +
      `?origins=${oLat},${oLng}` +
      `&destinations=${dLat},${dLng}` +
      `&departure_time=now` +
      `&key=${encodeURIComponent(key)}`;

    const r = await fetch(url);
    const data = await r.json();

    const el = data?.rows?.[0]?.elements?.[0];
    if (!el || el.status !== "OK") {
      return res.status(200).json({ ok: false, data });
    }

    const duration = el.duration_in_traffic ?? el.duration;

    return res.status(200).json({
      ok: true,
      distanceText: el.distance?.text ?? "",
      durationText: duration?.text ?? "",
      durationSeconds: duration?.value ?? 0,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Server error" });
  }
}

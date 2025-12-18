const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.eta = onRequest(
  { secrets: ["GOOGLE_MAPS_API_KEY"] },
  async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") return res.status(204).send("");

      const oLat = req.query.oLat;
      const oLng = req.query.oLng;
      const dLat = req.query.dLat;
      const dLng = req.query.dLng;

      if (!oLat || !oLng || !dLat || !dLng) {
        return res.status(400).json({ error: "Missing query params" });
      }

      const key = process.env.GOOGLE_MAPS_API_KEY;
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
        logger.warn("Distance Matrix not OK", data);
        return res.status(200).json({ ok: false, data });
      }

      const duration = el.duration_in_traffic ?? el.duration;

      return res.status(200).json({
        ok: true,
        distanceText: el.distance?.text ?? "",
        durationText: duration?.text ?? "",
        durationSeconds: duration?.value ?? 0,
      });
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

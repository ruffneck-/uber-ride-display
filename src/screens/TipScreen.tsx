import { QRCodeSVG } from "qrcode.react";


const TIP = {
  venmoUrl: "https://venmo.com/code?user_id=2400963281289216961&created=1765830323E",     // replace
  cashAppUrl: "https://cash.app/$MarkWanner303",  // replace
};

function QR({ label, url }: { label: string; url: string }) {
  return (
    <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 16, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{label}</div>
      <div style={{ background: "white", display: "inline-block", padding: 10, borderRadius: 12 }}>
        <QRCodeSVG value={url} size={220} />
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>Scan to tip</div>
    </div>
  );
}

export default function TipScreen() {
  return (
    <div style={{ height: "100%", border: "1px solid #eee", borderRadius: 16, padding: 18, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 38, fontWeight: 900 }}>🙏 Thanks for riding!</div>
        <div style={{ fontSize: 23 , opacity: 0.8, marginTop: 6 }}>
          Tips are appreciated, they help keep this car clean and fueled — never required. If you need anything just let me know! You can also just tip in the Uber app.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <QR label="Venmo" url={TIP.venmoUrl} />
        <QR label="Cash App" url={TIP.cashAppUrl} />
      </div>

      <div style={{ marginTop: 14, textAlign: "center", fontSize: 38, opacity: 0.7 }}>
        ⭐⭐ If you enjoyed the ride, a 5-star rating helps a ton. ⭐⭐
      </div>
    </div>
  );
}

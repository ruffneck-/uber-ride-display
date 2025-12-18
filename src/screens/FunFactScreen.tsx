import { useEffect, useState } from "react";

const FACTS = [
  "Fun fact: Honey never spoils — edible honey has been found in ancient tombs.",
  "Fun fact: Octopuses have three hearts.",
  "Fun fact: A day on Venus is longer than a year on Venus.",
  "Fun fact: Bananas are berries, but strawberries aren’t (botanically).",
  "Fun fact: The Eiffel Tower can grow ~6 inches in summer due to heat expansion.",
];

export default function FunFactScreen() {
  const [fact, setFact] = useState(FACTS[0]);

  useEffect(() => {
    setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
  }, []);

  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", border: "1px solid #eee", borderRadius: 16 }}>
      <div style={{ maxWidth: 900, padding: 26, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 12 }}>🤓 Fun Fact</div>
        <div style={{ fontSize: 28, lineHeight: 1.25 }}>{fact}</div>
      </div>
    </div>
  );
}

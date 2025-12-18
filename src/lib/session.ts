import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { SessionDoc, Telemetry } from "../types";

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sessionRef(code: string) {
  return doc(db, "sessions", code);
}

export async function createSession(code: string) {
  const now = Date.now();
  const data: SessionDoc = {
    code,
    active: false,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(sessionRef(code), data, { merge: true });
  return data;
}

export async function readSession(code: string) {
  const snap = await getDoc(sessionRef(code));
  return snap.exists() ? (snap.data() as SessionDoc) : null;
}

export async function setDestination(code: string, destinationName: string, destination: { lat: number; lng: number }) {
  await updateDoc(sessionRef(code), {
    destinationName,
    destination,
    updatedAt: Date.now(),
  });
}

export async function setActive(code: string, active: boolean) {
  await updateDoc(sessionRef(code), { active, updatedAt: Date.now() });
}

export async function pushTelemetry(code: string, last: Telemetry) {
  await updateDoc(sessionRef(code), { last, updatedAt: Date.now() });
}

export function subscribeSession(code: string, cb: (s: SessionDoc | null) => void) {
  return onSnapshot(sessionRef(code), (snap) => {
    cb(snap.exists() ? (snap.data() as SessionDoc) : null);
  });
}

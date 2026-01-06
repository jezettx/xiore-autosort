// FILE: lib/session.ts
import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "";

if (!SECRET) {
  throw new Error("SESSION_SECRET kosong. Tambahkan di .env.local");
}

function sign(input: string) {
  return crypto.createHmac("sha256", SECRET).update(input).digest("base64url");
}

export function createSessionValue(username: string, maxAgeSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const base = `${username}|${exp}`;
  const sig = sign(base);
  return `${base}|${sig}`;
}

export function verifySessionValue(value: string | undefined) {
  if (!value) return null;

  const parts = value.split("|");
  if (parts.length !== 3) return null;

  const [username, expStr, sig] = parts;
  const base = `${username}|${expStr}`;

  const expected = sign(base);

  // CHANGE: mencegah timingSafeEqual throw kalau panjang beda
  if (sig.length !== expected.length) return null;

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return null;
  if (Math.floor(Date.now() / 1000) > exp) return null;

  return { username };
}

export async function getSession() {
  // CHANGE: samain nama cookie dengan yang diset di route login
  const sessionValue = (await cookies()).get("xiore_session")?.value;
  return verifySessionValue(sessionValue);
}

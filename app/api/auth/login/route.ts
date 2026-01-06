// FILE: app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSessionValue } from "@/lib/session";

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const usernameRaw = body?.username;
  const password = body?.password;

  if (typeof usernameRaw !== "string" || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const username = usernameRaw.trim().toLowerCase();
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  }

  const { rows } = await pool.query(
    "select username, password_hash from users where username = $1 limit 1",
    [username]
  );

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const maxAge = 60 * 60 * 8; // 8 jam
  const session = createSessionValue(username, maxAge);

  const res = NextResponse.json({ ok: true, username });

  res.cookies.set("xiore_session", session, {
    httpOnly: true,
    // CHANGE: jangan secure: true di localhost/http (cookie bisa nggak kesimpen)
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return res;
}
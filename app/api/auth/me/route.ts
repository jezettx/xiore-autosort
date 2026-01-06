import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionValue } from "@/lib/session";

export async function GET() {
  const c = await cookies();
  const session = c.get("xiore_session")?.value;

  const payload = verifySessionValue(session);
  if (!payload) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({ ok: true, username: payload.username });
}

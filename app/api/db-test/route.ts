import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL kosong / tidak kebaca" },
      { status: 500 }
    );
  }

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const r = await client.query("select 1 as ok");
    return NextResponse.json({ ok: true, result: r.rows[0] });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => {});
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/errors";
import { safeJson } from "@/lib/http";
import { createEmptyExcelRow } from "@/lib/excelContract";

type ApiResponse = {
  ok: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

function clampRowCount(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 1;
  if (n < 1) return 1;
  if (n > 100) return 100;
  return Math.floor(n);
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const accessToken = process.env.MS_GRAPH_ACCESS_TOKEN;
    const shareUrl = process.env.MS_EXCEL_SHARE_URL;

    if (!accessToken || !shareUrl) {
      return NextResponse.json(
        { ok: false, message: "Not configured", error: "Set MS_GRAPH_ACCESS_TOKEN and MS_EXCEL_SHARE_URL" },
        { status: 401 }
      );
    }

    const body = await safeJson<{ rowCount?: unknown }>(req);
    const rowCount = clampRowCount(body?.rowCount ?? 1);

    // panggil /api/excel/send berkali-kali? NO.
    // paling simpel: bikin dummy payload bentuk BuildExcelRowInput dan kirim ke /send 1-1 memang lebih lambat.
    // Kalau kamu mau batch beneran, nanti kita bikin helper batch, tapi sekarang fokus kamu validasi flow dulu.

    const results: Array<{ no: number; ok: boolean; error?: string }> = [];

    for (let i = 1; i <= rowCount; i++) {
      const row = createEmptyExcelRow(900000 + i);
      row.tanggalSewa = "2026-01-12";
      row.costume = `TEST ROW ${i}`;
      row.status = "booked";
      row.nama = `TEST ${i}`;
      row.noWa = "08123456789";
      row.kontakDarurat = "08129876543";
      row.sosmed = "@yodha"; // ini yang ngetes #NAME?
      row.sosmedTemen = "@temen";

      // call internal endpoint send biar reuse logic (simple)
      const res = await fetch(new URL("/api/excel/send", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      if (!res.ok) {
        const txt = await res.text();
        results.push({ no: row.no, ok: false, error: txt });
      } else {
        results.push({ no: row.no, ok: true });
      }
    }

    const okCount = results.filter((x) => x.ok).length;

    return NextResponse.json({
      ok: true,
      message: `Test complete. Inserted ${okCount}/${rowCount} rows`,
      data: { rowCount, results },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Test failed", error: getErrorMessage(e) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Method not allowed", error: "Use POST" },
    { status: 405 }
  );
}

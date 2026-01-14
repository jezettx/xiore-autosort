// app/api/excel/send/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/errors";
import { safeJson } from "@/lib/http";
import { ExcelRow, BuildExcelRowInput, buildExcelRow } from "@/lib/excelContract";
import { resolveDriveItem, findTable, appendRowToTable } from "@/lib/excelGraph";

interface ApiResponse {
  ok: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

// payload bisa 2 bentuk
function isBuildInput(x: unknown): x is BuildExcelRowInput {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return "tanggal_pemakaian" in o || "nama_lengkap" in o || "item_disewa" in o;
}

function isExcelRow(x: unknown): x is ExcelRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.no === "number" && typeof o.nama === "string";
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const accessToken = process.env.MS_GRAPH_ACCESS_TOKEN;
    const shareUrl = process.env.MS_EXCEL_SHARE_URL;
    const tableName = process.env.MS_EXCEL_TABLE_NAME || "tblRent2026";

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, message: "Microsoft Graph token not configured", error: "Set MS_GRAPH_ACCESS_TOKEN in environment" },
        { status: 401 }
      );
    }
    if (!shareUrl) {
      return NextResponse.json(
        { ok: false, message: "Excel share URL not configured", error: "Set MS_EXCEL_SHARE_URL in environment" },
        { status: 401 }
      );
    }

    const raw = await safeJson<unknown>(request);
    if (!raw) {
      return NextResponse.json(
        { ok: false, message: "Invalid request payload", error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    let row: ExcelRow | null = null;

    if (isBuildInput(raw)) {
      // dari /api/save (parsing payload)
      row = buildExcelRow(raw);
      if (!Number.isFinite(row.no) || row.no <= 0 || !row.nama) {
        return NextResponse.json(
          { ok: false, message: "Invalid parsed input", error: "Missing required: no (number) and nama_lengkap (string)" },
          { status: 400 }
        );
      }
    } else if (isExcelRow(raw)) {
      // sudah ExcelRow
      row = raw;
      if (!Number.isFinite(row.no) || row.no <= 0 || !row.nama) {
        return NextResponse.json(
          { ok: false, message: "Invalid ExcelRow data", error: "Missing required fields: no (number>0) and nama (string)" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { ok: false, message: "Invalid payload shape", error: "Send ExcelRow OR BuildExcelRowInput (parsed fields)" },
        { status: 400 }
      );
    }

    const { driveId, itemId } = await resolveDriveItem(shareUrl, accessToken);
    const tableId = await findTable(driveId, itemId, tableName, accessToken);
    await appendRowToTable(driveId, itemId, tableId, row, accessToken);

    return NextResponse.json(
      {
        ok: true,
        message: "Row successfully appended to Excel table",
        data: { rowNo: row.no, nama: row.nama, tableName, timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error("[/api/excel/send] Error:", errorMsg);

    if (errorMsg.includes("Unauthorized") || errorMsg.includes("401")) {
      return NextResponse.json(
        { ok: false, message: "Authentication failed", error: "Invalid or expired Microsoft Graph token" },
        { status: 401 }
      );
    }
    if (errorMsg.includes("Forbidden") || errorMsg.includes("403")) {
      return NextResponse.json(
        { ok: false, message: "Access denied", error: "You do not have permission to access this Excel file" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Failed to append row to Excel", error: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    { ok: false, message: "Method not allowed", error: "Use POST to append rows to Excel" },
    { status: 405 }
  );
}

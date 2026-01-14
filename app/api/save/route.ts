import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { buildExcelRow } from "@/lib/excelContract";
import { syncRowToExcel } from "@/lib/excelGraph";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validasi field wajib sesuai DB contract
    const requiredFields = ["nama_lengkap", "no_wa", "tanggal_pemakaian", "item_disewa"];
    for (const field of requiredFields) {
      const v = data?.[field];
      if (!v || (typeof v === "string" && !v.trim())) {
        return NextResponse.json({ ok: false, error: `${field} is required` }, { status: 400 });
      }
    }

    const submissionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : null;

    // Insert DB dulu (source of truth)
    const insertQuery = `
      INSERT INTO rentals (
        submission_id,
        created_by,
        raw_text,
        nama_lengkap,
        alamat,
        no_wa,
        no_wa_kontak_a,
        no_wa_kontak_b,
        sosmed_user,
        sosmed_teman,
        tanggal_pemakaian,
        metode_pengiriman,
        item_disewa,
        jenis_jaminan,
        catatan,
        status_rental,
        excel_sync_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )
      RETURNING id, created_at
    `;

    const values = [
      submissionId,                 // $1
      data.created_by || "web",     // $2
      data.raw_text || "",          // $3
      data.nama_lengkap || "",      // $4
      data.alamat || "",            // $5
      data.no_wa || "",             // $6
      data.no_wa_kontak_a || "",    // $7
      data.no_wa_kontak_b || "",    // $8
      data.sosmed_user || "",       // $9
      data.sosmed_teman || "",      // $10
      data.tanggal_pemakaian,       // $11
      data.metode_pengiriman || "", // $12
      data.item_disewa || "",       // $13
      data.jenis_jaminan || "",     // $14
      data.catatan || "",           // $15
      data.status_rental || "booked", // $16
      "pending",                    // $17 (nanti diupdate)
    ];

    const result = await pool.query(insertQuery, values);
    const insertedId = result.rows?.[0]?.id as number;
    const created_at = result.rows?.[0]?.created_at;

    // Excel sync best-effort
    let excelAttempted = false;
    let excelSynced = false;
    let excelError: string | null = null;

    const accessToken = process.env.MS_GRAPH_ACCESS_TOKEN;
    const shareUrl = process.env.MS_EXCEL_SHARE_URL;
    const tableName = process.env.MS_EXCEL_TABLE_NAME || "tblRent2026";

    if (accessToken && shareUrl) {
      excelAttempted = true;
      try {
        const excelRowInput = {
          no: insertedId,
          tanggal_pemakaian: data.tanggal_pemakaian,
          item_disewa: data.item_disewa,
          status_rental: data.status_rental || "booked",
          nama_lengkap: data.nama_lengkap,
          alamat: data.alamat,
          no_wa: data.no_wa,
          no_wa_kontak_a: data.no_wa_kontak_a,
          sosmed_user: data.sosmed_user,
          sosmed_teman: data.sosmed_teman,
        };

        const excelRow = buildExcelRow(excelRowInput);
        const syncResult = await syncRowToExcel(excelRow, accessToken, shareUrl, tableName);

        excelSynced = !!syncResult.excelSynced;
        excelError = syncResult.excelError ?? null;
      } catch (e) {
        excelSynced = false;
        excelError = e instanceof Error ? e.message : String(e);
      }
    } else {
      excelAttempted = false;
      excelSynced = false;
      excelError = "Excel config not set";
    }

    // Update status di DB (best-effort)
    const finalStatus = !excelAttempted ? "pending" : excelSynced ? "synced" : "failed";

    try {
      await pool.query(
        `UPDATE rentals SET excel_sync_status = $1 WHERE id = $2`,
        [finalStatus, insertedId]
      );
    } catch (e) {
      console.error("Failed to update excel_sync_status:", e);
    }

    return NextResponse.json(
      {
        ok: true,
        saved: true,
        insertedId,
        created_at,
        excelAttempted,
        excelSynced,
        excelSyncStatus: finalStatus,
        excelError,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ ok: false, saved: false, error: "Failed to save data" }, { status: 500 });
  }
}

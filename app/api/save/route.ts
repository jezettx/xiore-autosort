import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validasi field wajib
    const requiredFields = ["nama", "no_wa", "tanggal", "item"];
    for (const field of requiredFields) {
      if (!data[field] || !data[field].trim()) {
        return NextResponse.json(
          { ok: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert ke database
    const query = `
      INSERT INTO sewa_data (
        nama, alamat, no_wa, kontak_kerabat_a, kontak_kerabat_b, 
        sosmed, tanggal, pengiriman, item, jaminan, catatan
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
    `;

    const values = [
      data.nama || "",
      data.alamat || "",
      data.no_wa || "",
      data.kontak_kerabat_a || "",
      data.kontak_kerabat_b || "",
      data.sosmed || "",
      data.tanggal || "",
      data.pengiriman || "",
      data.item || "",
      data.jaminan || "",
      data.catatan || "",
    ];

    await pool.query(query, values);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save data" },
      { status: 500 }
    );
  }
}

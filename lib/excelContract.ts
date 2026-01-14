// lib/excelContract.ts

export type ExcelRow = {
  no: number;             // A: No
  tanggalSewa: string;    // B: Tanggal Sewa
  costume: string;        // C: Costume
  status: string;         // D: Status
  nama: string;           // E: Nama
  tanggalLahir: string;   // F: Tanggal Lahir
  alamatPaket: string;    // G: Alamat paket
  alamatKtp: string;      // H: Alamat KTP
  noWa: string;           // I: No WA
  kontakDarurat: string;  // J: Kontak darurat
  sosmed: string;         // K: Sosmed
  sosmedTemen: string;    // L: Sosmed temen
};

export type BuildExcelRowInput = {
  no: number;

  // hasil parsing / payload dari save
  tanggal_pemakaian?: unknown;
  item_disewa?: unknown;
  status_rental?: unknown;
  nama_lengkap?: unknown;

  // optional / jarang ada
  tanggal_lahir?: unknown;
  alamat?: unknown;
  alamat_ktp?: unknown;

  no_wa?: unknown;
  no_wa_kontak_a?: unknown;
  no_wa_kontak_b?: unknown;

  sosmed_user?: unknown;
  sosmed_teman?: unknown;
};

export function sanitizeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v).trim();
  return "";
}

function joinContacts(a: string, b: string): string {
  const aa = a.trim();
  const bb = b.trim();

  if (aa && bb) return `${aa} / ${bb}`;
  if (aa) return aa;
  if (bb) return bb;
  return "";
}

/**
 * Ini inti fix kamu.
 * Excel bisa nganggep string sebagai formula kalau diawali: = + - @
 * Solusi paling aman: prefix apostrophe -> dipaksa jadi TEXT.
 */
export function escapeExcelText(v: string): string {
  const s = v.trim();
  if (!s) return "";
  if (/^[=+\-@]/.test(s)) return "'" + s;
  return s;
}

export function buildExcelRow(input: BuildExcelRowInput): ExcelRow {
  const no = Number.isFinite(input.no) ? input.no : 0;

  const tanggalSewa = sanitizeString(input.tanggal_pemakaian);
  const costume = sanitizeString(input.item_disewa);

  const statusRaw = sanitizeString(input.status_rental);
  const status = statusRaw ? statusRaw : "booked";

  const nama = sanitizeString(input.nama_lengkap);

  const tanggalLahir = sanitizeString(input.tanggal_lahir);
  const alamatPaket = sanitizeString(input.alamat);
  const alamatKtp = sanitizeString(input.alamat_ktp);

  const noWa = sanitizeString(input.no_wa);

  const kontakA = sanitizeString(input.no_wa_kontak_a);
  const kontakB = sanitizeString(input.no_wa_kontak_b);
  const kontakDarurat = joinContacts(kontakA, kontakB);

  const sosmed = sanitizeString(input.sosmed_user);
  const sosmedTemen = sanitizeString(input.sosmed_teman);

  return {
    no,
    tanggalSewa,
    costume,
    status,
    nama,
    tanggalLahir,
    alamatPaket,
    alamatKtp,
    noWa,
    kontakDarurat,
    sosmed,
    sosmedTemen,
  };
}

// INI yang dikirim ke Graph rows/add (HARUS 12 kolom urut A–L)
export function excelRowToValues(row: ExcelRow): (string | number)[] {
  return [
    row.no,
    escapeExcelText(row.tanggalSewa),
    escapeExcelText(row.costume),
    escapeExcelText(row.status),
    escapeExcelText(row.nama),
    escapeExcelText(row.tanggalLahir),
    escapeExcelText(row.alamatPaket),
    escapeExcelText(row.alamatKtp),
    escapeExcelText(row.noWa),
    escapeExcelText(row.kontakDarurat),
    escapeExcelText(row.sosmed),      // ✅ FIX #NAME? (@)
    escapeExcelText(row.sosmedTemen), // ✅ FIX #NAME? (@)
  ];
}

export function createEmptyExcelRow(no: number): ExcelRow {
  return {
    no,
    tanggalSewa: "",
    costume: "",
    status: "booked",
    nama: "",
    tanggalLahir: "",
    alamatPaket: "",
    alamatKtp: "",
    noWa: "",
    kontakDarurat: "",
    sosmed: "",
    sosmedTemen: "",
  };
}

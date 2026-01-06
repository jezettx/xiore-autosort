// app/api/parse/route.ts
import { NextResponse } from "next/server";

type Parsed = {
  nama_lengkap?: string;
  alamat_lengkap?: string;
  no_wa?: string;
  kontak_a?: string;
  kontak_b?: string;
  sosmed_user?: string;
  sosmed_teman?: string;
  tanggal_pemakaian?: string;
  pengiriman?: string;
  item_disewa?: string;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[’‘`"]/g, "'")
    .replace(/\s+/g, " ");
}

function cleanLabel(s: string) {
  // buang "(...)" biar label stabil
  return norm(s).replace(/\(.*?\)/g, "").trim();
}

function cleanValue(s: string) {
  return (s ?? "").trim().replace(/\s+/g, " ");
}

function tokensOfLabel(label: string) {
  return cleanLabel(label)
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function stripBulletPrefix(s: string) {
  // "a. 0812" / "b) 0812" / "a: 0812" => "0812"
  return s.replace(/^(a|b)\s*[\.\)\-:]\s*/i, "").trim();
}

function stripPlatformPrefix(s: string) {
  // "ig: abc" -> "abc"
  return s.replace(/^(ig|instagram|tiktok|twitter|x)\s*[:=\-]\s*/i, "").trim();
}

function isLikelyPairLine(line: string) {
  return (
    line.includes(":") ||
    line.includes("=") ||
    line.includes("-") ||
    line.includes("–")
  );
}

function splitLabelValue(line: string) {
  // toleran separator: ":" "=" "-" "–"
  const m = line.match(/^(.+?)\s*[:=\-–]\s*(.*)$/);
  if (!m) return null;
  return { label: cleanLabel(m[1]), value: cleanValue(m[2]) };
}

function parseForm(text: string): Parsed {
  const out: Parsed = {};
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // mode konteks: bullet a/b hanya diproses jika mode aktif
  let mode: null | "kontak" | "sosmed_teman" = null;

  // buat handle kasus label kosong lalu value di line berikutnya
  let expectingAt: null | "user" | "teman" = null;

  const setAt = (which: "user" | "teman", v: string) => {
    let value = cleanValue(v);
    value = stripBulletPrefix(value);
    value = stripPlatformPrefix(value);
    if (!value) return;

    const handle = value.startsWith("@") ? value : `@${value}`;
    if (which === "user") out.sosmed_user = handle;
    else out.sosmed_teman = handle;
  };

  const setKontakNextSlot = (v: string) => {
    const value = cleanValue(stripBulletPrefix(v));
    if (!value) return;
    if (!out.kontak_a) out.kontak_a = value;
    else if (!out.kontak_b) out.kontak_b = value;
  };

  const setKontak = (which: "a" | "b", v: string) => {
    const value = cleanValue(stripBulletPrefix(v));
    if (!value) return;
    if (which === "a") out.kontak_a = value;
    else out.kontak_b = value;
  };

  for (const raw of lines) {
    const line = raw;

    // ===== expectingAt (baris berikutnya adalah username) =====
    if (expectingAt) {
      if (!isLikelyPairLine(line)) {
        setAt(expectingAt, line);
        expectingAt = null;
        continue;
      }
      expectingAt = null;
    }

    // ===== bullet a/b =====
    const bullet = line.match(/^(a|b)\s*[\.\)\-:]\s*(.+)?$/i);
    if (bullet && mode) {
      const which = bullet[1].toLowerCase() as "a" | "b";
      const v = (bullet[2] ?? "").trim();

      if (mode === "kontak") {
        if (v) setKontak(which, v);
        // kalau udah dapet dua kontak, matiin mode
        if (out.kontak_a && out.kontak_b) mode = null;
        continue;
      }

      if (mode === "sosmed_teman") {
        // ambil bullet pertama yang ada isinya sebagai sosmed_teman
        if (v) setAt("teman", v);
        mode = null;
        continue;
      }
    }

    // ===== split label/value =====
    const pair = splitLabelValue(line);
    if (!pair) continue;

    const label = pair.label;
    const value = pair.value;
    const t = tokensOfLabel(label);

    const has = (...keys: string[]) => keys.every((k) => t.includes(k));
    const any = (...keys: string[]) => keys.some((k) => t.includes(k));

    // ===== NAMA =====
    if ((has("nama", "lengkap")) || (t.length === 1 && t[0] === "nama")) {
      out.nama_lengkap = value;
      mode = null;
      continue;
    }

    // ===== ALAMAT =====
    if (any("alamat")) {
      out.alamat_lengkap = value;
      mode = null;
      continue;
    }

    // ===== NO WA UTAMA =====
    // penting: match token "no"+"wa" atau "whatsapp" (bukan substring "wa")
    const isKontakLabel = any("kontak", "ortu", "kerabat", "sahabat");
    const isWAMain = (has("no", "wa") && !isKontakLabel) || (any("whatsapp") && !isKontakLabel);

    if (isWAMain) {
      out.no_wa = value;
      mode = null;
      continue;
    }

    // ===== KONTAK WA =====
    const isKontakWA =
      (any("kontak") || any("ortu") || any("kerabat") || any("sahabat")) &&
      (has("no", "wa") || any("wa", "whatsapp"));

    if (isKontakWA) {
      // kalau ada value setelah ":" langsung isi slot kontak
      if (value) setKontakNextSlot(value);
      // aktifkan mode untuk nangkep bullet a/b berikutnya
      mode = "kontak";
      continue;
    }

    // ===== SOSMED USER / TEMAN =====
    const isSosmed =
      any("sosmed", "akun", "ig", "instagram", "tiktok", "twitter", "x");

    if (isSosmed) {
      const isTeman = any("teman");

      if (!value) {
        // value di baris berikutnya / bullet
        if (isTeman) mode = "sosmed_teman";
        else expectingAt = "user";
      } else {
        if (isTeman) setAt("teman", value);
        else setAt("user", value);
        mode = null;
      }
      continue;
    }

    // ===== TANGGAL =====
    if (any("tanggal", "tgl", "date")) {
      out.tanggal_pemakaian = value;
      mode = null;
      continue;
    }

    // ===== PENGIRIMAN =====
    if (any("pengiriman", "kirim") || (has("metode", "pengiriman"))) {
      out.pengiriman = value;
      mode = null;
      continue;
    }

    // ===== ITEM DISEWA =====
    if (any("item", "disewa", "sewa", "costume", "kostum", "wig", "weapon")) {
      out.item_disewa = value;
      mode = null;
      continue;
    }

    // label lain -> ignore
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { ok: false, error: "Text is required" },
        { status: 400 }
      );
    }

    const parsed = parseForm(text);

    if (Object.values(parsed).every((v) => !v || !v.trim())) {
      return NextResponse.json(
        { ok: false, error: "Tidak ada data yang bisa diparsing" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, parsed });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Parse error" },
      { status: 500 }
    );
  }
}
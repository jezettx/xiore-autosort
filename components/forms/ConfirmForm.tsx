// components/forms/ConfirmForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Parsed = {
  nama_lengkap?: string;
  alamat_lengkap?: string;
  no_wa?: string;
  kontak_a?: string;
  kontak_b?: string;
  sosmed_user?: string;
  sosmed_teman?: string;
  tanggal_pemakaian?: string; // bisa "19-01-2026" dari UI
  pengiriman?: string;
  item_disewa?: string;
  jenis_jaminan?: string;
  catatan?: string;
  status_rental?: string;
};

function normalizeDateToISO(input: string): string {
  // kalau sudah ISO (YYYY-MM-DD) biarin
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(input)) return input;

  // kalau format DD-MM-YYYY → ubah jadi YYYY-MM-DD
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/;
  const m = input.match(dmy);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // fallback: kirim apa adanya (biar backend yang reject kalau invalid)
  return input;
}

export default function ConfirmForm() {
  const router = useRouter();

  const [data, setData] = useState<Parsed | null>(() => {
    const raw = sessionStorage.getItem("xiore_parsed");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [saving, setSaving] = useState(false);

  const missing = useMemo(() => {
    if (!data) return [];

    const m: string[] = [];
    if (!data.nama_lengkap || !data.nama_lengkap.trim()) m.push("nama_lengkap");
    if (!data.no_wa || !data.no_wa.trim()) m.push("no_wa");
    if (!data.tanggal_pemakaian || !data.tanggal_pemakaian.trim()) m.push("tanggal_pemakaian");
    if (!data.item_disewa || !data.item_disewa.trim()) m.push("item_disewa");

    return m;
  }, [data]);

  const update = (key: keyof Parsed, value: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      sessionStorage.setItem("xiore_parsed", JSON.stringify(next));
      return next;
    });
  };

  const back = () => router.push("/input");

  const submit = async () => {
    if (!data) return;

    if (missing.length) {
      alert("Masih ada field wajib yang kosong. Isi dulu di sini.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        raw_text: sessionStorage.getItem("xiore_raw") || "",
        nama_lengkap: data.nama_lengkap?.trim() || "",
        alamat: data.alamat_lengkap?.trim() || "",
        no_wa: data.no_wa?.trim() || "",
        no_wa_kontak_a: (data.kontak_a || "").trim(),
        no_wa_kontak_b: (data.kontak_b || "").trim(),
        sosmed_user: (data.sosmed_user || "").trim(),
        sosmed_teman: (data.sosmed_teman || "").trim(),
        tanggal_pemakaian: normalizeDateToISO((data.tanggal_pemakaian || "").trim()),
        metode_pengiriman: (data.pengiriman || "").trim(),
        item_disewa: (data.item_disewa || "").trim(),
        jenis_jaminan: (data.jenis_jaminan || "").trim(),
        catatan: (data.catatan || "").trim(),
        status_rental: (data.status_rental || "booked").trim(),
      };

      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        alert("Gagal simpan: " + (result?.error || "unknown error"));
        return;
      }

      // feedback minimal tapi jelas
      const msg =
        result.excelSyncStatus === "synced"
          ? "✅ Saved to DB & Excel synced"
          : result.excelSyncStatus === "failed"
            ? "⚠️ Saved to DB, Excel failed (cek log / coba batch sync)"
            : "⏳ Saved to DB, Excel pending";

      alert(msg);

      router.push("/menu");
    } catch (err) {
      console.error(err);
      alert("❌ Error network/server");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-sm text-zinc-200">
        Data belum ada. Balik ke input dulu.
        <div className="mt-3">
          <button
            onClick={back}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 text-sm text-blue-100">
        Wajib diisi: <b>nama lengkap</b>, <b>no wa</b>, <b>tanggal pemakaian</b>, <b>item disewa</b>.
        {missing.length ? (
          <div className="mt-2 text-red-200">⚠️ Kosong: {missing.join(", ")}</div>
        ) : null}
      </div>

      {/* form fields ringkas (lanjutkan sesuai UI kamu, ini contoh minimal) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nama lengkap *" value={data.nama_lengkap || ""} onChange={(v) => update("nama_lengkap", v)} />
        <Field label="No WA *" value={data.no_wa || ""} onChange={(v) => update("no_wa", v)} />
        <Field label="No WA Kontak (A)" value={data.kontak_a || ""} onChange={(v) => update("kontak_a", v)} />
        <Field label="No WA Kontak (B)" value={data.kontak_b || ""} onChange={(v) => update("kontak_b", v)} />
        <Field label="Akun sosmed" value={data.sosmed_user || ""} onChange={(v) => update("sosmed_user", v)} />
        <Field label="Akun sosmed temen" value={data.sosmed_teman || ""} onChange={(v) => update("sosmed_teman", v)} />
        <Field
          label="Tanggal pemakaian *"
          value={data.tanggal_pemakaian || ""}
          onChange={(v) => update("tanggal_pemakaian", v)}
          hint="format: DD-MM-YYYY atau YYYY-MM-DD"
        />
        <Field label="Pengiriman" value={data.pengiriman || ""} onChange={(v) => update("pengiriman", v)} />
      </div>

      <div className="space-y-2">
        <Label>Costume/Wig/Weapon yang disewa *</Label>
        <textarea
          value={data.item_disewa || ""}
          onChange={(e) => update("item_disewa", e.target.value)}
          className="h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-zinc-100 outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={back}
          disabled={saving}
          className="w-1/2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900 disabled:opacity-60"
        >
          Kembali
        </button>

        <button
          onClick={submit}
          disabled={saving}
          className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-zinc-100 outline-none"
      />
      {hint ? <div className="text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}

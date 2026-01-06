"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ConfirmForm() {
  const router = useRouter();

  const [data, setData] = useState<Parsed | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("xiore_parsed");
    if (!raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      setData(null);
    }
  }, []);

  const missing = useMemo(() => {
    if (!data) return [];
    const req: Array<keyof Parsed> = ["nama_lengkap", "no_wa", "tanggal_pemakaian", "item_disewa"];
    return req.filter((k) => !data[k] || !String(data[k]).trim());
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
    // integrasi save nanti. sekarang minimal guard.
    if (!data) return;

    if (missing.length) {
      alert("Masih ada field wajib yang kosong. Isi dulu di sini.");
      return;
    }

    alert("OK. Next: integrasi save API.");
  };

  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-sm text-zinc-200">
        Data belum ada. Balik ke input dulu.
        <div className="mt-3">
          <button
            type="button"
            onClick={back}
            className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-2 text-sm hover:bg-zinc-900/60"
          >
            Kembali ke Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 text-sm text-blue-100">
        Wajib diisi: <b>nama lengkap</b>, <b>no wa</b>, <b>tanggal pemakaian</b>, <b>item disewa</b>.
        <br />
        Kontak a/b opsional — kalau ada, isi aja.
        {missing.length ? (
          <div className="mt-2 text-red-200">
            ⚠️ Kosong: {missing.join(", ")}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        <Field label="NAMA LENGKAP *" value={data.nama_lengkap || ""} onChange={(v) => update("nama_lengkap", v)} />
        <Area label="ALAMAT LENGKAP" value={data.alamat_lengkap || ""} onChange={(v) => update("alamat_lengkap", v)} />
        <Field label="NO WA *" value={data.no_wa || ""} onChange={(v) => update("no_wa", v)} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="NO WA KONTAK (A)" value={data.kontak_a || ""} onChange={(v) => update("kontak_a", v)} />
          <Field label="NO WA KONTAK (B)" value={data.kontak_b || ""} onChange={(v) => update("kontak_b", v)} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="AKUN SOSMED (TIKTOK/IG/TWITTER)" value={data.sosmed_user || ""} onChange={(v) => update("sosmed_user", v)} />
          <Field label="AKUN SOSMED TEMAN DEKAT" value={data.sosmed_teman || ""} onChange={(v) => update("sosmed_teman", v)} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="TANGGAL PEMAKAIAN *" value={data.tanggal_pemakaian || ""} onChange={(v) => update("tanggal_pemakaian", v)} />
          <Field label="PENGIRIMAN" value={data.pengiriman || ""} onChange={(v) => update("pengiriman", v)} />
        </div>

        <Area label="COSTUME/WIG/WEAPON YANG DISEWA *" value={data.item_disewa || ""} onChange={(v) => update("item_disewa", v)} />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={back}
          className="w-1/2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900/60"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={submit}
          className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold tracking-wide text-zinc-300">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-blue-500/50"
      />
    </label>
  );
}

function Area(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold tracking-wide text-zinc-300">{props.label}</div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="min-h-[92px] w-full rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 text-sm text-zinc-100 outline-none focus:border-blue-500/50"
      />
    </label>
  );
}

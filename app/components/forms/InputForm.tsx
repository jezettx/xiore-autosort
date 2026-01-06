// app/components/InputForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

export default function InputForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = useMemo(() => {
    return [
      "contoh format (bebas urutan):",
      "Nama Lengkap: ",
      "Alamat Lengkap: ",
      "No Wa: ",
      "No Wa kontak Ortu/kerabat/sahabat yang bisa dihubungi :",
      "a. ",
      "b. ",
      "Akun Sosmed(Tiktok/IG/Twitter): ",
      "Akun Sosmed teman dekat: ",
      "a. ",
      "b. ",
      "Tanggal Pemakaian: ",
      "Pengiriman(pilih salah satu): ",
      "Costume/wig/weapon yang disewa",
    ].join("\n");
  }, []);

  const handleUseTemplate = () => {
    setText(template + "\n\n");
  };

  const submit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error || "Terjadi kesalahan saat parsing");
        setLoading(false);
        return;
      }

      const parsed: Parsed = data.parsed;

      sessionStorage.setItem("xiore_raw", text);
      sessionStorage.setItem("xiore_parsed", JSON.stringify(parsed));

      router.push("/confirm");
    } catch {
      setError("Terjadi kesalahan saat parsing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-200">CLUE FORMAT</p>
            <p className="mt-1 text-xs text-zinc-400">
              Biar parsing stabil, pakai pattern <span className="text-zinc-200">label: isi</span>. Bebas urutan & tidak case-sensitive.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseTemplate}
            className="shrink-0 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900/60"
          >
            Pakai Template
          </button>
        </div>

        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-950/60 p-3 text-xs text-zinc-300">
{template}
        </pre>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-zinc-200">FORMULIR SEWA</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste formulir sewa di sini..."
          className="min-h-[320px] w-full rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 text-sm text-zinc-100 outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 text-sm text-blue-100">
        Field wajib: <b>nama</b>, <b>no wa</b>, <b>tanggal</b>, <b>item</b>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={loading || !text.trim()}
        onClick={submit}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Parsing..." : "Lanjutkan"}
      </button>
    </div>
  );
}

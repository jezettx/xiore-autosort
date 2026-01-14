// components/forms/LoginForm.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage({ type: "success", text: `Login berhasil! Selamat datang ${data.username}` });
        setUsername("");
        setPassword("");
        
        // Delay 2 detik biar user sempat baca notif sukses
        setTimeout(() => {
          router.push("/menu");
        }, 2000);
      } else {
        setMessage({ type: "error", text: `Login gagal: ${data.error}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-300"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="Enter your username"
            className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-blue-500/40 focus:bg-zinc-900/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-blue-500/40 focus:bg-zinc-900/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/40 disabled:shadow-none"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </>
  );
}

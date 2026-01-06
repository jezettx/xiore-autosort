// FILE: app/components/MenuLinks.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MenuLinks() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      router.replace("/login");
      router.refresh();
    } catch {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="space-y-3">
      <Link
        href="/input"
        className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-500 active:bg-blue-700 transition"
      >
        Mulai Input Form
      </Link>
      
      <div className="pt-3">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 transition"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
// FILE: app/menu/page.tsx
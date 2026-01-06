// FILE: app/menu/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import MenuLinks from "@/app/components/MenuLinks";

export default async function MenuPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-90 w-90 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
        <section className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
          <header className="mb-6">
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-center">Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-400 text-center">
              Mulai input formulir sewa, lalu konfirmasi sebelum disimpan.
            </p>
          </header>

          <MenuLinks />
        </section>
      </div>
    </main>
  );
}

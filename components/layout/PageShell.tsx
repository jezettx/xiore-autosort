// components/layout/PageShell.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  backHref?: string;
  backLabel?: string;
};

const widthMap = {
  sm: "max-w-sm",
  md: "max-w-2xl", 
  lg: "max-w-4xl",
} as const;

export default function PageShell({
  title,
  subtitle,
  children,
  maxWidth = "md",
  backHref,
  backLabel = "Kembali",
}: PageShellProps) {
  const router = useRouter();

  const handleBack = () => {
    if (!backHref) return;
    router.push(backHref);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-90 w-90 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full items-center px-6 py-12">
        <section
          className={`w-full ${widthMap[maxWidth]} mx-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-7 backdrop-blur`}
        >
          <header className={`mb-6 ${backHref ? 'flex items-start justify-between gap-3' : 'text-center'}`}>
            <div className={backHref ? '' : 'w-full'}>
              <h1 className={`font-semibold tracking-tight ${backHref ? 'text-2xl' : 'mt-1 text-3xl'}`}>{title}</h1>
              {subtitle ? (
                <p className={`text-sm text-zinc-400 ${backHref ? 'mt-1' : 'mt-2'}`}>{subtitle}</p>
              ) : null}
            </div>

            {backHref ? (
              <button
                type="button"
                onClick={handleBack}
                className="shrink-0 rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
              >
                {backLabel}
              </button>
            ) : null}
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}

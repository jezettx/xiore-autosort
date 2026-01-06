// FILE: app/(app)/menu/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import MenuLinks from "@/app/components/layout/MenuLinks";
import PageShell from "@/app/components/layout/PageShell";

export default async function MenuPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <PageShell
      title="Dashboard"
      subtitle="Mulai input formulir sewa, lalu konfirmasi sebelum disimpan."
      maxWidth="sm"
    >
      <MenuLinks />
    </PageShell>
  );
}

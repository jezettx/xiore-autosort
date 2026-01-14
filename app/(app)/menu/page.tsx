// FILE: app/(app)/menu/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import MenuLinks from "@/components/layout/MenuLinks";
import PageShell from "@/components/layout/PageShell";

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

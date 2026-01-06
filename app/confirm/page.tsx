import ConfirmForm from "@/app/components/ConfirmForm";
import PageShell from "@/app/components/PageShell";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ConfirmPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <PageShell
      title="Konfirmasi Data"
      subtitle="Periksa kembali sebelum data disimpan"
      maxWidth="lg"
      backHref="/input"
      backLabel="Kembali"
    >
      <ConfirmForm />
    </PageShell>
  );
}

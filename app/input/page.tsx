// app/input/page.tsx
import InputForm from "@/app/components/forms/InputForm";
import PageShell from "@/app/components/layout/PageShell";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function InputPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <PageShell
      title="Input Formulir"
      subtitle="Masukkan data penyewa dan detail sewa"
      maxWidth="lg"
      backHref="/menu"
      backLabel="Kembali ke Menu"
    >
      <InputForm />
    </PageShell>
  );
}

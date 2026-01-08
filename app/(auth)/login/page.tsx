// FILE: app/(auth)/login/page.tsx
import LoginForm from "@/components/forms/LoginForm";
import PageShell from "@/components/layout/PageShell";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/menu");
  }

  return (
    <PageShell
      title="XIORE"
      subtitle="Sign in to your account"
      maxWidth="sm"
    >
      <div className="w-80 max-w-full mx-auto">
        <LoginForm />
      </div>
    </PageShell>
  );
}

// FILE: app/(auth)/login/page.tsx
import LoginForm from "@/app/components/forms/LoginForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/menu");
  }

  return <LoginForm />;
}

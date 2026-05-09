import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-margin-mobile md:p-margin-desktop">
      {children}
    </main>
  );
}

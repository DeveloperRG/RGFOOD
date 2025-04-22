// ~/app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { DashboardNav } from "~/components/layout/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardNav user={session.user}>{children}</DashboardNav>;
}

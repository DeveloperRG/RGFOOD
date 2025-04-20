// ~/app/(dashboard)/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "~/types/shared-types";
import AdminDashboardClient from "./client";

export default async function AdminDashboardPage() {
  const session = await auth();

  // Redirect if not logged in or not an admin
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  // Get counts for dashboard metrics
  const foodCourtCount = await db.foodcourt.count();
  const ownerCount = await db.user.count({
    where: {
      role: UserRole.FOODCOURT_OWNER,
    },
  });
  const orderCount = await db.order.count();
  const totalMenuItems = await db.menuItem.count();

  // Get pending registrations (food court owners without stalls)
  const pendingRegistrations = await db.user.findMany({
    where: {
      role: UserRole.FOODCOURT_OWNER,
      foodcourts: {
        none: {},
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // No longer fetching recent orders

  return (
    <AdminDashboardClient
      user={session.user}
      metrics={{
        foodCourtCount,
        ownerCount,
        orderCount,
        totalMenuItems,
      }}
      pendingRegistrations={pendingRegistrations}
    />
  );
}
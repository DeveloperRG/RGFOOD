// ~/src/app/(dashboard)/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "~/lib/shared-types";
import { AdminDashboard } from "~/components/dashboard/admin/admin-dashboard";

export default async function AdminDashboardPage() {
  const session = await auth();

  // Redirect if not logged in or not an admin
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
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
      ownedFoodcourts: {
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

  return (
    <AdminDashboard
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

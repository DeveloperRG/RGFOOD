import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole, FoodcourtStatus } from "~/lib/shared-types";
import { AdminDashboard } from "~/components/dashboard/admin/admin-dashboard";

export default async function AdminDashboardPage() {
  const session = await auth();

  // Redirect if not logged in or not an admin
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const ownerWithFoodcourt = await db.user.count({
    where: {
      role: UserRole.OWNER,
      NOT: { ownedFoodcourt: null },
    },
  });

  const ownerWithoutFoodcourt = await db.user.count({
    where: {
      role: UserRole.OWNER,
      ownedFoodcourt: null,
    },
  });

  const foodCourtCount = {
    active: await db.foodcourt.count({
      where: { isActive: true },
    }),
    inactive: await db.foodcourt.count({
      where: { isActive: false },
    }),
  };

  const foodcourtStatus = {
    active: await db.foodcourt.count({
      where: { status: FoodcourtStatus.BUKA },
    }),
    inactive: await db.foodcourt.count({
      where: { status: FoodcourtStatus.TUTUP },
    }),
  };

  const ownerCount = {
    total: ownerWithFoodcourt + ownerWithoutFoodcourt,
    withFoodcourt: ownerWithFoodcourt,
    withoutFoodcourt: ownerWithoutFoodcourt,
  };

  const orderCount = await db.order.count();
  const totalMenuItems = await db.menuItem.count();

  // Get pending registrations (food court owners without stalls)
  const pendingRegistrations = await db.user.findMany({
    where: {
      role: UserRole.OWNER,
      ownedFoodcourt: {},
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
        foodcourtStatus,
        ownerCount,
        orderCount,
        totalMenuItems,
      }}
      pendingRegistrations={pendingRegistrations}
    />
  );
}

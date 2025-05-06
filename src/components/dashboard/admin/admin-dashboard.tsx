//~\src\components\dashboard\admin\admin-dashboard.tsx

import { DashboardMetricCard } from "~/components/dashboard/admin/dashboard-metric-card";
import { UserRole } from "~/lib/shared-types";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

interface PendingRegistration {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
}

interface AdminDashboardProps {
  user: User;
  metrics: {
    foodCourtCount: {
      active: number;
      inactive: number;
    };
    foodcourtStatus: {
      active: number;
      inactive: number;
    };
    ownerCount: {
      total: number;
      withFoodcourt: number;
      withoutFoodcourt: number;
    };
    orderCount: number;
    totalMenuItems: number;
    tableAvailability: {
      available: number;
      unavailable: number;
    };
  };
  pendingRegistrations: PendingRegistration[];
}

export async function AdminDashboard({
  user,
  metrics,
  pendingRegistrations,
}: AdminDashboardProps) {
  const totalFoodCourts =
    (metrics.foodCourtCount.active || 0) +
      (metrics.foodCourtCount.inactive || 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Mengelola Stand, pemilik, dan keseluruhan operasi platform
        </p>
      </div>

      {/* Dashboard metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DashboardMetricCard
          className="h-[250px]"
          title="Operasi Stand"
          link="/admin/foodcourts"
          value={
            metrics.foodcourtStatus.active + metrics.foodcourtStatus.inactive
          }
          description="Total Stand Yang Beroperasi"
          data={[
            {
              name: "Buka",
              value: metrics.foodcourtStatus.active,
              fill: "#16a34a",
            },
            {
              name: "Tutup",
              value: metrics.foodcourtStatus.inactive,
              fill: "#b91c1c",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-green-600">
                Buka : {metrics.foodcourtStatus.active}
              </span>
              <span className="font-semibold text-red-700">
                Tutup : {metrics.foodcourtStatus.inactive}
              </span>
            </div>
          }
        />

        <DashboardMetricCard
          className="h-[250px]"
          title="Status Stand"
          link="/admin/foodcourts"
          value={totalFoodCourts}
          description="Status Stand Yang Tersedia"
          data={[
            {
              name: "Disewa",
              value: metrics.foodCourtCount.active,
              fill: "#2563eb",
            },
            {
              name: "Tidak Disewa",
              value: metrics.foodCourtCount.inactive,
              fill: "#d97706",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-blue-600">
                Disewa : {metrics.foodCourtCount.active}
              </span>
              <span className="font-semibold text-amber-700">
                Tidak Disewa : {metrics.foodCourtCount.inactive}
              </span>
            </div>
          }
        />

        <DashboardMetricCard
          className="h-[250px]"
          title="Owners Stand"
          link="/admin/owners"
          value={metrics.ownerCount.total}
          description="Status Owner yang Memiliki Stand"
          data={[
            {
              name: "Ada",
              value: metrics.ownerCount.withFoodcourt,
              fill: "#7c3aed",
            },
            {
              name: "Tidak Ada",
              value: metrics.ownerCount.withoutFoodcourt,
              fill: "#0e7490",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-purple-700">
                Ada : {metrics.ownerCount.withFoodcourt}
              </span>
              <span className="font-semibold text-cyan-800">
                Tidak Ada : {metrics.ownerCount.withoutFoodcourt}
              </span>
            </div>
          }
        />

        <DashboardMetricCard
          className="h-[250px]"
          title="Ketersediaan Meja"
          link="/admin/tables"
          value={
            metrics.tableAvailability.available +
            metrics.tableAvailability.unavailable
          }
          description="Jumlah meja yang tersedia dan tidak"
          data={[
            {
              name: "Tersedia",
              value: metrics.tableAvailability.available,
              fill: "#365314",
            },
            {
              name: "Tidak Tersedia",
              value: metrics.tableAvailability.unavailable,
              fill: "#78350f",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-lime-900">
                Tersedia : {metrics.tableAvailability.available}
              </span>
              <span className="font-semibold text-orange-900">
                Tidak Tersedia : {metrics.tableAvailability.unavailable}
              </span>
            </div>
          }
        />
      </div>
    </div>
  );

  
}

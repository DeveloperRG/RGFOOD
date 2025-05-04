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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              fill: "#4ade80",
            },
            {
              name: "Tutup",
              value: metrics.foodcourtStatus.inactive,
              fill: "#f87171",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-green-500">
                Buka : {metrics.foodcourtStatus.active}
              </span>
              <span className="font-semibold text-red-500">
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
              name: "Aktif",
              value: metrics.foodCourtCount.active,
              fill: "#60a5fa",
            },
            {
              name: "Tidak Aktif",
              value: metrics.foodCourtCount.inactive,
              fill: "#facc15",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-blue-500">
                Aktif : {metrics.foodCourtCount.active}
              </span>
              <span className="font-semibold text-yellow-500">
                Tidak Aktif : {metrics.foodCourtCount.inactive}
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
              fill: "#a78bfa",
            },
            {
              name: "Tidak Ada",
              value: metrics.ownerCount.withoutFoodcourt,
              fill: "#22d3ee",
            },
          ]}
          extraContent={
            <div className="flex justify-end gap-4 text-sm">
              <span className="font-semibold text-purple-500">
                Ada : {metrics.ownerCount.withFoodcourt}
              </span>
              <span className="font-semibold text-cyan-500">
                Tidak Ada : {metrics.ownerCount.withoutFoodcourt}
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}

// ~/app/(dashboard)/admin/client.tsx
"use client";

import { DashboardLayout } from "~/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ShoppingCart, Store, Users, Book } from "lucide-react";
import { DashboardMetricCard } from "~/components/dashboard/dashboard-metric-card";
import { PendingRegistrationsCard } from "~/components/dashboard/pending-registrations-card";
import { OrderStatus, UserRole } from "~/types/shared-types";

// Types based on your schema
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  // Add other properties as needed
}

interface PendingRegistration {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
}

interface AdminDashboardClientProps {
  user: User;
  metrics: {
    foodCourtCount: number;
    ownerCount: number;
    orderCount: number;
    totalMenuItems: number;
  };
  pendingRegistrations: PendingRegistration[];
}

export default function AdminDashboardClient({
  user,
  metrics,
  pendingRegistrations,
}: AdminDashboardClientProps) {
  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage food courts, owners, and overall platform operations
          </p>
        </div>

        {/* Dashboard metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricCard
            title="Food Courts"
            value={metrics.foodCourtCount}
            description="Total registered food courts"
            icon={<Store className="h-5 w-5" />}
            trend={null}
          />
          <DashboardMetricCard
            title="Food Court Owners"
            value={metrics.ownerCount}
            description="Total registered owners"
            icon={<Users className="h-5 w-5" />}
            trend={null}
          />
          <DashboardMetricCard
            title="Orders"
            value={metrics.orderCount}
            description="Total orders processed"
            icon={<ShoppingCart className="h-5 w-5" />}
            trend={null}
          />
          <DashboardMetricCard
            title="Menu Items"
            value={metrics.totalMenuItems}
            description="Total menu items available"
            icon={<Book className="h-5 w-5" />}
            trend={null}
          />
        </div>

        <div className="w-full">
          {/* Pending registrations */}
          <PendingRegistrationsCard
            pendingRegistrations={pendingRegistrations}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
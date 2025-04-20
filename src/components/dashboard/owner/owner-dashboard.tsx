// ~/components/dashboard/owner/owner-dashboard.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
import OwnerFoodcourtCard from "~/components/dashboard/owner/owner-foodcourt-card";
import RecentOrdersCard from "~/components/dashboard/owner/recent-orders-card";
import type { User, Order, OrderStats } from "~/lib/shared-types";

interface OwnerDashboardProps {
  owner: User;
  foodcourtId: string | undefined;
  isAdmin: boolean;
  orderStats: OrderStats;
  recentOrders: Order[];
}

export function OwnerDashboard({
  owner,
  foodcourtId,
  isAdmin,
  orderStats,
  recentOrders,
}: OwnerDashboardProps) {
  // Find the specific foodcourt by ID
  const currentFoodcourt = owner.foodcourts.find((f) => f.id === foodcourtId);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Owner Dashboard</h1>

      {!foodcourtId && (
        <Alert className="mb-6">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>No foodcourt assigned</AlertTitle>
          <AlertDescription>
            You don&apos;t have any foodcourts assigned to your account yet.
            {isAdmin && (
              <div className="mt-2">
                <Link
                  href={`/admin/owners/${owner.id}/assign`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Assign Foodcourt
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {foodcourtId && currentFoodcourt && (
        <>
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStats.totalOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStats.pendingOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Preparing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStats.preparingOrders}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Ready for Pickup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStats.readyOrders}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {/* Pass the foodcourt properly to the OwnerFoodcourtCard component */}
            <OwnerFoodcourtCard foodcourt={currentFoodcourt} />

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href={`/owner/${owner.id}/menu`}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full justify-start",
                  })}
                >
                  Manage Menu
                </Link>
                <Link
                  href={`/owner/${owner.id}/orders`}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full justify-start",
                  })}
                >
                  Manage Orders
                </Link>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              <RecentOrdersCard orders={recentOrders} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
import type { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { OwnerFoodcourtCard } from "~/components/dashboard/admin/owners/owner-foodcourt-card";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const metadata: Metadata = {
  title: "Owner Details",
  description: "View foodcourt owner details",
};

interface OwnerDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function OwnerDetailsPage({
  params,
}: OwnerDetailsPageProps) {
  
  const { id } = await params;
  
  const owner = await db.user.findUnique({
    where: {
      id,
      role: "OWNER",
    },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      createdAt: true,
      emailVerified: true,
      ownedFoodcourt: {
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          isActive: true,
          _count: {
            select: {
              menuItems: true,
            },
          },
        },
      },

      permissions: {
        select: {
          id: true,
          canEditMenu: true,
          canViewOrders: true,
          canUpdateOrders: true,
          foodcourtId: true,
        },
      },
    },
  });

  if (!owner) {
    notFound();
  }

  const hasAssignedFoodcourt = !!owner.ownedFoodcourt;

  const foodcourtId = owner.ownedFoodcourt?.id;
  const activeOrdersCount = foodcourtId
    ? await db.orderItem.count({
        where: {
          foodcourtId,
          order: {
            status: {
              in: ["PENDING", "PREPARING", "READY"],
            },
          },
        },
      })
    : 0;

  const ownerPermission = owner.permissions.find(
    (p) => p.foodcourtId === foodcourtId,
  );

  const mappedPermission = ownerPermission
    ? { ...ownerPermission, role: "OWNER" }
    : undefined;

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Link href="/admin/owners">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Owners
          </Button>
        </Link>
      </div>

      <div className="grid gap-2 py-0 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Account details</CardDescription>
            <Badge
              className={
                owner.emailVerified
                  ? "border-green-150 bg-green-100 text-green-700"
                  : "border-red-150 bg-red-100 text-red-700"
              }
              variant={owner.emailVerified ? "default" : "destructive"}
            >
              {owner.emailVerified ? "Verified" : "Not Verified"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Name
              </h3>
              <p>{owner.name || "—"}</p>
            </div>

            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Email
              </h3>
              <p>{owner.email}</p>
            </div>

            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Account Created
              </h3>
              <p>{format(new Date(owner.createdAt), "PPP")}</p>
            </div>

            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Email Verification
              </h3>
              {owner.emailVerified ? (
                <p>
                  Verified on {format(new Date(owner.emailVerified), "PPP")}
                </p>
              ) : (
                <p className="text-destructive">Not verified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Foodcourt</CardTitle>
              <CardDescription>Foodcourt managed by this owner</CardDescription>
            </CardHeader>
            <CardContent>
              {owner.ownedFoodcourt ? (
                <OwnerFoodcourtCard 
                  foodcourt={owner.ownedFoodcourt}
                  permission={mappedPermission}
                  activeOrdersCount={activeOrdersCount}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No foodcourt assigned to this owner yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

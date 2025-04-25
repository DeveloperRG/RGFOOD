// ~/src/app/(dashboard)/admin/foodcourts/[id]/page.tsx

import type { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, UserPlus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const metadata: Metadata = {
  title: "Foodcourt Details",
  description: "View foodcourt details and manage owner",
};

interface FoodcourtDetailsPageProps {
  params: {
    foodcourtId: string; // Fixed parameter name to match the file path
  };
}

export default async function FoodcourtDetailsPage({
  params,
}: FoodcourtDetailsPageProps) {
  const { foodcourtId } = params; // Use the correct parameter name

  // Fetch foodcourt with owner and creator data
  const foodcourt = await db.foodcourt.findUnique({
    where: { id: foodcourtId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      creator: {
        // Add creator data
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      foodcourtCategories: true,
      menuItems: {
        select: {
          id: true,
          name: true,
          price: true,
          isAvailable: true,
        },
      },
      ownerPermissions: true,
    },
  });

  if (!foodcourt) {
    notFound();
  }

  // Check if foodcourt has a real owner (not system user)
  const hasRealOwner =
    !!foodcourt.owner && foodcourt.owner.email !== "system@foodcourt.internal";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/foodcourts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourts
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {foodcourt.name}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={foodcourt.isActive ? "default" : "destructive"}>
              {foodcourt.isActive ? "Active" : "Inactive"}
            </Badge>
            {hasRealOwner && (
              <Badge variant="outline">
                Owned by {foodcourt.owner?.name || foodcourt.owner?.email}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/foodcourts/${foodcourtId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Foodcourt
            </Button>
          </Link>
          {!hasRealOwner && (
            <Link href={`/admin/foodcourts/${foodcourtId}/assign`}>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Owner
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* FoodcourtDetails component integrated directly */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Name
                </dt>
                <dd className="mt-1 text-sm">{foodcourt.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Address
                </dt>
                <dd className="mt-1 text-sm">{foodcourt.address}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Description
                </dt>
                <dd className="mt-1 text-sm">
                  {foodcourt.description || "No description provided"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Status
                </dt>
                <dd className="mt-1 text-sm">
                  {foodcourt.isActive ? "Active" : "Inactive"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Created At
                </dt>
                <dd className="mt-1 text-sm">
                  {foodcourt.createdAt.toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm">
                  {foodcourt.updatedAt.toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ownership Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Owner
                </dt>
                <dd className="mt-1 text-sm">
                  {foodcourt.owner ? (
                    <div>
                      <p>{foodcourt.owner.name || "Unnamed"}</p>
                      <p className="text-muted-foreground">
                        {foodcourt.owner.email}
                      </p>
                    </div>
                  ) : (
                    "No owner assigned"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Created By
                </dt>
                <dd className="mt-1 text-sm">
                  <div>
                    <p>{foodcourt.creator.name || "Unnamed"}</p>
                    <p className="text-muted-foreground">
                      {foodcourt.creator.email}
                    </p>
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Menu Items</CardTitle>
            <Link href={`/admin/foodcourts/${foodcourtId}/menu`}>
              <Button variant="outline" size="sm">
                Manage Menu
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {foodcourt.menuItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No menu items found
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="px-4 py-2 text-left font-medium">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodcourt.menuItems.slice(0, 5).map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">
                            ${Number(item.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                item.isAvailable ? "outline" : "secondary"
                              }
                            >
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {foodcourt.menuItems.length > 5 && (
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      Showing 5 of {foodcourt.menuItems.length} menu items
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Link href={`/admin/foodcourts/${foodcourtId}/categories`}>
              <Button variant="outline" size="sm">
                Manage Categories
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {foodcourt.foodcourtCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No categories found
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {foodcourt.foodcourtCategories.map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

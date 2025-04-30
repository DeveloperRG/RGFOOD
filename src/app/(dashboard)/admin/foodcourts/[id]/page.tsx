// ~/src/app/(dashboard)/admin/foodcourts/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, UserPlus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";

interface FoodcourtOwner {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

interface FoodcourtCategory {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface OwnerPermission {
  id: string;
  ownerId: string;
  foodcourtId: string;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
}

interface Foodcourt {
  id: string;
  name: string;
  address: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  creatorId: string;
  owner: FoodcourtOwner | null;
  creator: FoodcourtOwner | null;
  foodcourtCategories: FoodcourtCategory[];
  menuItems: MenuItem[];
  ownerPermissions: OwnerPermission[];
}

export default function FoodcourtDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [foodcourt, setFoodcourt] = useState<Foodcourt | null>(null);
  const [loading, setLoading] = useState(true);

  const foodcourtId = params.id as string;

  useEffect(() => {
    async function fetchFoodcourt() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/foodcourts/${foodcourtId}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.push("/admin/foodcourts");
            return;
          }
          throw new Error("Failed to fetch foodcourt");
        }

        const data = await response.json();
        setFoodcourt(data);
      } catch (error) {
        toast.error("Failed to load foodcourt details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (foodcourtId) {
      fetchFoodcourt();
    }
  }, [foodcourtId, router, toast]);

  // Display loading state
  if (loading) {
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
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div>
              <Skeleton className="h-10 w-[300px]" />
              <div className="mt-2">
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </div>
          </div>
          <div>
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-2 h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!foodcourt) {
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold">Foodcourt not found</h2>
            <p className="text-muted-foreground mt-2">
              The requested foodcourt could not be found.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/foodcourts")}
            >
              Return to Foodcourts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if foodcourt has a real owner (not system user)
  const hasRealOwner =
    !!foodcourt.owner && foodcourt.owner.email !== "system@foodcourt.internal";

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Link href="/admin/foodcourts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourts
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        {/* Kiri: Logo dan info */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="bg-muted/20 h-16 w-16 overflow-hidden rounded-md border">
            {foodcourt.logo ? (
              <img
                src={foodcourt.logo}
                alt={`${foodcourt.name} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                <svg
                  xmlns="https://www.pexels.com/photo/flat-lay-photography-of-vegetable-salad-on-plate-1640777" 
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8"></path>
                  <rect x="8" y="8" width="8" height="8" rx="1"></rect>
                </svg>
              </div>
            )}
          </div>

          {/* Nama & Badge */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {foodcourt.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant={foodcourt.isActive ? "default" : "destructive"}
                className={
                  foodcourt.isActive
                    ? "border-green-150 bg-green-100 text-green-700"
                    : "border-red-150 bg-red-100 text-red-700"
                }
              >
                {foodcourt.isActive ? "Active" : "Inactive"}
              </Badge>
              {hasRealOwner && (
                <Badge variant="outline">
                  Owned by {foodcourt.owner?.name || foodcourt.owner?.email}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Kanan: Tombol */}
        <div className="flex flex-col items-end gap-2">
          <Link href={`/admin/foodcourts/${foodcourtId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-1 h-4 w-4" />
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
      <div className="grid gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Detail Information</CardTitle>
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
                  Logo
                </dt>
                <dd className="mt-1 text-sm">
                  <div className="bg-muted/20 h-24 w-40 overflow-hidden rounded-md border">
                    {foodcourt.logo ? (
                      <img
                        src={foodcourt.logo}
                        alt="Foodcourt logo"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8"></path>
                          <rect x="8" y="8" width="8" height="8" rx="1"></rect>
                        </svg>
                      </div>
                    )}
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Created At
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(foodcourt.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm font-medium">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(foodcourt.updatedAt).toLocaleDateString()}
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
                  {foodcourt.creator && (
                    <div>
                      <p>{foodcourt.creator.name || "Unnamed"}</p>
                      <p className="text-muted-foreground">
                        {foodcourt.creator.email}
                      </p>
                    </div>
                  )}
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
            {!foodcourt.menuItems || foodcourt.menuItems.length === 0 ? (
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
            {!foodcourt.foodcourtCategories ||
            foodcourt.foodcourtCategories.length === 0 ? (
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
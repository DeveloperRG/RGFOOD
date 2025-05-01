"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Edit, Trash2, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null; // Changed from imageUrl to image to match API
  imagePublicId: string | null;
  isAvailable: boolean;
  foodcourtId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenuItem() {
      try {
        setLoading(true);
        console.log(`Fetching menu item details for ID: ${params.menuId}`);

        const response = await fetch(
          `/api/foodcourt/${params.id}/menu/${params.menuId}`,
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error: ${response.status}`, errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Received menu item data:", data.menuItem);
        setMenuItem(data.menuItem);
      } catch (err) {
        console.error("Error fetching menu item:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch menu item",
        );
        toast.error("Failed to load menu item details");
      } finally {
        setLoading(false);
      }
    }

    if (params.id && params.menuId) {
      fetchMenuItem();
    }
  }, [params.id, params.menuId]);

  const toggleItemAvailability = async () => {
    if (!menuItem) return;

    try {
      const response = await fetch(
        `/api/foodcourt/${params.id}/menu/${params.menuId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAvailable: !menuItem.isAvailable }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const updatedItem = await response.json();
      setMenuItem((prevItem) =>
        prevItem ? { ...prevItem, isAvailable: updatedItem.isAvailable } : null,
      );
      toast.success(
        `Item ${updatedItem.isAvailable ? "available" : "unavailable"}`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update availability",
      );
    }
  };

  const handleDeleteItem = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/foodcourt/${params.id}/menu/${params.menuId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      toast.success("Menu item deleted successfully");
      router.push(`/owner/${params.id}/foodcourt/menu`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete menu item",
      );
    }
  };

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <p>Loading menu item details...</p>
        </div>
      </div>
    );
  }

  if (error || !menuItem) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-xl font-semibold">Menu Item Not Found</h3>
          <p className="text-muted-foreground mb-6">
            {error || "The requested menu item could not be found."}
          </p>
          <Button
            onClick={() => router.push(`/owner/${params.id}/foodcourt/menu`)}
          >
            Return to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push(`/owner/${params.id}/foodcourt/menu`)}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
          <h1 className="text-2xl font-bold">Menu Item Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{menuItem.name}</CardTitle>
                  <CardDescription>
                    {formatPrice(menuItem.price)}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    menuItem.isAvailable
                      ? "border-green-200 bg-green-100 text-green-800"
                      : "border-red-200 bg-red-100 text-red-800"
                  }
                >
                  {menuItem.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {menuItem.image ? (
                <div className="mb-4 overflow-hidden rounded-md">
                  <div className="relative h-60 w-full">
                    <Image
                      src={menuItem.image}
                      alt={menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-muted mb-4 flex h-60 w-full items-center justify-center rounded-md">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No image available
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-medium">Description</h3>
                <p className="text-muted-foreground">
                  {menuItem.description || "No description provided"}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Created</h3>
                  <p className="text-muted-foreground">
                    {formatDate(menuItem.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p className="text-muted-foreground">
                    {formatDate(menuItem.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={() =>
                  router.push(
                    `/owner/${params.id}/foodcourt/menu/${params.menuId}/edit`,
                  )
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Menu Item
              </Button>

              <Button
                variant={menuItem.isAvailable ? "outline" : "default"}
                className="w-full"
                onClick={toggleItemAvailability}
              >
                {menuItem.isAvailable
                  ? "Mark as Unavailable"
                  : "Mark as Available"}
              </Button>

              <Separator className="my-2" />

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteItem}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Menu Item
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

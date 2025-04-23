// ~/app/(dashboard)/owner/[id]/foodcourt/menu/[menuId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ChevronLeft, Edit, Clock, Calendar } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  category: Category | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  foodcourtId: string;
}

export default function MenuItemDetailPage() {
  const params = useParams();
  const ownerId = params.id as string;
  const menuId = params.menuId as string;

  const router = useRouter();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenuItemDetails() {
      try {
        setLoading(true);

        console.log(`Fetching from: /api/foodcourt/${ownerId}/menu/${menuId}`);
        const res = await fetch(`/api/foodcourt/${ownerId}/menu/${menuId}`);

        if (res.ok) {
          const data = await res.json();
          console.log("API response:", data);
          setMenuItem(data.menuItem);
        } else {
          console.error("API error:", await res.text());
          toast.error("Failed to load menu item details");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (ownerId && menuId) {
      fetchMenuItemDetails();
    } else {
      console.error("Missing required parameters:", { ownerId, menuId });
      setLoading(false);
    }
  }, [ownerId, menuId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 text-center">
        <h1 className="text-2xl font-bold">Menu Item Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The menu item you're looking for doesn't exist or couldn't be loaded.
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push(`/owner/${ownerId}/foodcourt/menu`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-4 flex items-center gap-1"
            onClick={() => router.push(`/owner/${ownerId}/foodcourt/menu`)}
          >
            <ChevronLeft className="h-4 w-4" /> Back to Menu
          </Button>
          <h1 className="text-2xl font-bold">Menu Item Details</h1>
        </div>

        <Button
          onClick={() =>
            router.push(`/owner/${ownerId}/foodcourt/menu/${menuId}/edit`)
          }
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" /> Edit Item
        </Button>
      </div>

      <div className="bg-card overflow-hidden rounded-lg shadow-md">
        <div className="bg-muted relative h-64 sm:h-80 md:h-96">
          <img
            src={menuItem.imageUrl || "/api/placeholder/1200/800"}
            alt={menuItem.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge
              variant={menuItem.isAvailable ? "default" : "secondary"}
              className="px-3 py-1 text-sm"
            >
              {menuItem.isAvailable ? "Available" : "Unavailable"}
            </Badge>

            {menuItem.category && (
              <Badge
                variant="outline"
                className="bg-white/80 px-3 py-1 text-sm backdrop-blur-sm"
              >
                {menuItem.category.name}
              </Badge>
            )}
          </div>

          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <div className="flex items-end justify-end">
              <div className="bg-primary rounded-full px-4 py-2 text-xl font-bold text-white">
                $
                {typeof menuItem.price === "string"
                  ? parseFloat(menuItem.price).toFixed(2)
                  : Number(menuItem.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h1 className="mb-4 text-2xl font-bold">{menuItem.name}</h1>
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">
              {menuItem.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Created on</p>
                <p className="text-muted-foreground">
                  {new Date(menuItem.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {new Date(menuItem.updatedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store, Edit, Calendar, ChefHat, Trash } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

interface Foodcourt {
  id: string;
  name: string;
  address: string;
  description: string | null;
  image: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  status: "BUKA" | "TUTUP";
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  _count?: {
    menuItems: number;
  };
}

interface FoodcourtCardGridProps {
  query: string;
  statusFilter?: "all" | "active" | "inactive";
  onQueryChange?: (query: string) => void;
  onCountChange?: (count: number) => void;
}

export function FoodcourtCardGrid({
  query,
  statusFilter = "all",
  onQueryChange,
  onCountChange,
}: FoodcourtCardGridProps) {
  const router = useRouter();
  const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
  const [filteredFoodcourts, setFilteredFoodcourts] = useState<Foodcourt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFoodcourts() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/foodcourts");
        if (!response.ok) {
          throw new Error("Failed to fetch foodcourts");
        }
        const data = await response.json();
        setFoodcourts(data.data);
      } catch (error) {
        console.error("Error fetching foodcourts:", error);
        toast.error("Failed to load foodcourts. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchFoodcourts();
  }, []);

  // Filter foodcourts based on query and status
  useEffect(() => {
    let filtered = [...foodcourts];

    // Apply search query filter
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (foodcourt) =>
          foodcourt.name.toLowerCase().includes(lowercaseQuery) ||
          foodcourt.address.toLowerCase().includes(lowercaseQuery) ||
          (foodcourt.owner?.name &&
            foodcourt.owner.name.toLowerCase().includes(lowercaseQuery)),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((foodcourt) =>
        statusFilter === "active" ? foodcourt.isActive : !foodcourt.isActive,
      );
    }

    setFilteredFoodcourts(filtered);

    // Update count if callback provided
    if (onCountChange) {
      onCountChange(filtered.length);
    }
  }, [foodcourts, query, statusFilter, onCountChange]);

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-1/2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredFoodcourts.length === 0) {
    return (
      <Card className="flex items-center justify-center p-8 text-center">
        <div>
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No foodcourts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {query
              ? `No foodcourts match "${query}"`
              : "Try adding a new foodcourt or changing your filters"}
          </p>
          <div className="mt-6">
            <Link href="/admin/foodcourts/new">
              <Button>Add New Foodcourt</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredFoodcourts.map((foodcourt) => (
        <Card key={foodcourt.id} className="flex flex-col overflow-hidden">
          {/* Image Section - Full width, no gaps */}
          <div className="relative h-48 w-full overflow-hidden">
            {foodcourt.image ? (
              <Image
                src={foodcourt.image}
                alt={foodcourt.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <Store className="h-12 w-12 text-slate-400" />
              </div>
            )}
            {/* Title overlay with gradient that covers the whole image area */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
              <h3 className="line-clamp-1 text-lg font-bold text-white">
                {foodcourt.name}
              </h3>
              <p className="line-clamp-1 text-sm text-white/90">
                {foodcourt.address}
              </p>
            </div>
          </div>

          <CardContent className="flex-grow p-4">
            <div className="mb-4 flex flex-wrap gap-2">
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
              <Badge
                variant={foodcourt.status === "BUKA" ? "default" : "secondary"}
                className={
                  foodcourt.status === "BUKA"
                    ? "border-green-150 bg-green-100 text-green-700"
                    : "border-orange-150 bg-orange-100 text-orange-700"
                }
              >
                {foodcourt.status === "BUKA" ? "Open" : "Closed"}
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {foodcourt.owner
                    ? foodcourt.owner.name || foodcourt.owner.email
                    : "No owner assigned"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Added on {formatDate(foodcourt.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-auto space-x-2 border-t p-3">
            <Link href={`/admin/foodcourts/${foodcourt.id}`} className="w-full">
              <Button className="w-full" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </Link>

            <Link
              href={`/admin/foodcourts/${foodcourt.id}/edit`}
              className="w-full"
            >
              <Button className="w-full" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>

            <form
              action={`/admin/foodcourts/${foodcourt.id}/delete`}
              method="POST"
              className="w-full"
            >
              <Button className="w-full" variant="destructive" type="submit">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </form>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// ~/components/dashboard/admin/foodcourts/foodcourt-CardGrid.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FoodcourtCardGridProps {
  query: string;
  onQueryChange: (query: string) => void;
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
  owner: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  foodcourtCategories: Array<{
    id: string;
    name: string;
  }>;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function FoodcourtCardGrid({
                                    query,
                                    onQueryChange,
                                  }: FoodcourtCardGridProps) {
  const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const router = useRouter();

  // Fetch foodcourts with search and pagination
  const fetchFoodcourts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Use 'name' parameter instead of 'search'
      if (query) {
        params.append("name", query);
      }

      const response = await fetch(
          `/api/admin/foodcourts?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch foodcourts");
      }

      const responseData = await response.json();

      // Update to match the new API structure with 'data' and 'meta'
      setFoodcourts(responseData.data);
      setPagination({
        total: responseData.meta.total,
        page: responseData.meta.page,
        limit: responseData.meta.limit,
        totalPages: responseData.meta.totalPages,
      });
    } catch (error) {
      toast.error("Failed to load foodcourts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle foodcourt deletion
  const handleDelete = async (id: string) => {
    if (
        !window.confirm(
            "Are you sure you want to delete this foodcourt? This action cannot be undone.",
        )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/foodcourts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete foodcourt");
      }
      toast.success("Foodcourt deleted successfully.");
      // Refresh the list
      fetchFoodcourts();
    } catch (error) {
      toast.error("Failed to delete foodcourt. Please try again.");
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Load foodcourts on initial render and when query or pagination changes
  useEffect(() => {
    fetchFoodcourts();
  }, [query, pagination.page, pagination.limit]);

  // UI for loading state
  if (loading && foodcourts.length === 0) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 flex-shrink-0 rounded-md" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
          ))}
        </div>
    );
  }

  // UI for no results
  if (foodcourts.length === 0) {
    return (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No foodcourts found</h3>
          <p className="text-muted-foreground mt-2">
            {query ? "Try a different search term or" : "Start by"} creating a new
            foodcourt.
          </p>
          <div className="mt-4">
            <Link href="/admin/foodcourts/new">
              <Button>Create New Foodcourt</Button>
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foodcourts.map((foodcourt) => (
              <Card key={foodcourt.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center justify-between">
                    <Link
                        href={`/admin/foodcourts/${foodcourt.id}`}
                        className="hover:underline"
                    >
                      {foodcourt.name}
                    </Link>
                    <Badge variant={foodcourt.isActive ? "default" : "secondary"}>
                      {foodcourt.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm">{foodcourt.address}</p>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {foodcourt.description || "No description provided"}
                    </p>
                    {foodcourt.owner && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Owner: {foodcourt.owner.name || foodcourt.owner.email}
                          </p>
                        </div>
                    )}
                    {foodcourt.foodcourtCategories && foodcourt.foodcourtCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {foodcourt.foodcourtCategories
                              .slice(0, 3)
                              .map((category) => (
                                  <Badge
                                      key={category.id}
                                      variant="outline"
                                      className="text-xs"
                                  >
                                    {category.name}
                                  </Badge>
                              ))}
                          {foodcourt.foodcourtCategories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{foodcourt.foodcourtCategories.length - 3} more
                              </Badge>
                          )}
                        </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 p-4">
                  <Link
                      href={`/admin/foodcourts/${foodcourt.id}`}
                      className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link
                      href={`/admin/foodcourts/${foodcourt.id}/edit`}
                      className="flex-shrink-0"
                  >
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => handleDelete(foodcourt.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
        {/* Pagination */}
        {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-1 pt-4">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                      (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          (p >= pagination.page - 1 && p <= pagination.page + 1),
                  )
                  .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                            <Button variant="outline" size="sm" disabled>
                              ...
                            </Button>
                        )}
                        <Button
                            variant={pagination.page === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                  ))}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
        )}
      </div>
  );
}
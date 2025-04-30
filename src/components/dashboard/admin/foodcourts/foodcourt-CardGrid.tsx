"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FoodcourtCardGridProps {
  query: string;
  onQueryChange: (query: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onCountChange?: (count: number) => void;
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
  // Updated to match the API response structure
  // Since the API doesn't include foodcourtCategories, we'll handle without it
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function FoodcourtCardGrid({
  query,
  onQueryChange,
  statusFilter,
  onCountChange,
}: FoodcourtCardGridProps) {
  const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [deleteTarget, setDeleteTarget] = useState<Foodcourt | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchFoodcourts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (query) {
        params.append("name", query); // Updated to match API parameter
      }

      const response = await fetch(
        `/api/admin/foodcourts?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch foodcourts");
      const data = await response.json();
      setFoodcourts(data.data); // Updated to match API response structure
      setPagination(data.meta); // Updated to match API response structure
    } catch (error) {
      toast.error("Failed to load foodcourts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/foodcourts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete foodcourt");
      toast.success("Foodcourt deleted successfully.");
      setDeleteTarget(null);
      fetchFoodcourts();
    } catch {
      toast.error("Failed to delete foodcourt. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    fetchFoodcourts();
  }, [query, pagination.page, pagination.limit]);

  const filteredFoodcourts = foodcourts.filter((fc) => {
    const matchesQuery = fc.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? fc.isActive === true
          : fc.isActive === false;
    return matchesQuery && matchesStatus;
  });

  useEffect(() => {
    onCountChange?.(filteredFoodcourts.length);
  }, [filteredFoodcourts.length, onCountChange]);

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

  if (filteredFoodcourts.length === 0) {
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
        {filteredFoodcourts.map((foodcourt) => (
          <div
            key={foodcourt.id}
            className="group relative rounded-xl border border-gray-300 bg-white p-[2px] transition-all duration-1 ease-in-out hover:border-transparent hover:bg-gradient-to-r hover:from-purple-100 hover:via-red-100 hover:to-purple-100 hover:shadow-lg"
          >
            <Card className="group-hover:bg-opacity-90 flex flex-col overflow-hidden rounded-[10px] bg-white transition-all duration-300">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/foodcourts/${foodcourt.id}`}
                    className="hover:underline"
                  >
                    {foodcourt.name}
                  </Link>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                      foodcourt.isActive
                        ? "border-green-150 bg-green-100 text-green-700"
                        : "border-red-150 bg-red-100 text-red-700"
                    }`}
                  >
                    {foodcourt.isActive ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-36 flex-1 p-4">
                <div className="space-y-2">
                  <p className="text-sm">{foodcourt.address}</p>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {foodcourt.description || "No description provided"}
                  </p>
                  <div className="min-h-5 text-sm">
                    {foodcourt.owner && (
                      <p className="text-muted-foreground">
                        Owner: {foodcourt.owner.name || foodcourt.owner.email}
                      </p>
                    )}
                  </div>
                )}
                {/* Removed the foodcourtCategories section since it's not in the API response */}
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

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Foodcourt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Apakah anda yakin ingin menghapus foodcourt{" "}
            <span className="font-semibold">{deleteTarget?.name}</span>?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              className="bg-green-500 text-white hover:bg-green-400 hover:text-white"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Tidak
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-400 hover:text-white"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Ya Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Loader2, Search, X, ArrowRight } from "lucide-react";

interface Foodcourt {
  id: string;
  name: string;
  description: string;
  logo: string;
  address: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export default function TablePage() {
  const params = useParams();
  const tableId = params.tableId as string;

  const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 100,
    offset: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFoodcourts, setFilteredFoodcourts] = useState<Foodcourt[]>([]);

  useEffect(() => {
    if (tableId) {
      localStorage.setItem("tableId", tableId);
    }

    async function fetchFoodcourts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/foodcourt`);

        if (!response.ok) {
          throw new Error("Failed to fetch foodcourts");
        }

        const data = await response.json();
        setFoodcourts(data.foodcourts);
        setFilteredFoodcourts(data.foodcourts);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchFoodcourts();
  }, [tableId, pagination.limit, pagination.offset]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFoodcourts(foodcourts);
    } else {
      const filtered = foodcourts.filter(
        (foodcourt) =>
          foodcourt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          foodcourt.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredFoodcourts(filtered);
    }
  }, [searchQuery, foodcourts]);

  if (loading && foodcourts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen pb-28">
      {/* Table Info */}
      <div className="bg-green-50 p-4 text-center text-green-700">
        <span className="font-medium">Table #{tableId}</span> - Your orders will
        be delivered here
      </div>

      {/* Search */}
      <div className="mx-auto max-w-2xl p-4">
        <div className="relative">
          <Input
            placeholder="Cari Stand"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1.5 right-1 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mx-auto max-w-4xl space-y-4 px-4">
        {filteredFoodcourts.length > 0 ? (
          filteredFoodcourts.map((foodcourt) => (
            <Link
              key={foodcourt.id}
              href={`/table/${tableId}/foodcourts/${foodcourt.id}`}
              className="block"
            >
              <Card className="transition hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                    {foodcourt.logo ? (
                      <img
                        src={foodcourt.logo}
                        alt={foodcourt.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <StoreIcon />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">
                      {foodcourt.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {foodcourt.address}
                    </p>
                  </div>
                  <ArrowRight className="text-green-500" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? `Tidak ada stand cocok dengan "${searchQuery}"`
                : "Belum ada stand yang tersedia."}
            </p>
            {searchQuery && (
              <Button className="mt-4" onClick={() => setSearchQuery("")}>
                Hapus Pencarian
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Cart Button */}
      {(() => {
        const cart =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("cart") || "[]")
            : [];
        const itemCount = cart.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );

        if (itemCount > 0) {
          return (
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white px-4 py-3 shadow-md">
              <Link href="/cart">
                <Button className="w-full bg-green-500 text-white hover:bg-green-600">
                  Lihat Keranjang ({itemCount} item)
                </Button>
              </Link>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}

function StoreIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.89l.81-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.66.89l.81 1.22a2 2 0 001.66.89H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

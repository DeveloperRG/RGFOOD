"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Loader2,
  Search,
  X,
  ArrowRight,
  ShoppingBag,
  Tag,
  Clock,
} from "lucide-react";

interface Foodcourt {
  id: string;
  name: string;
  description: string | null;
  logo: string;
  logo: string;
  address: string;
  status: string; // Added status field
  categories?: FoodcourtCategory[]; // Optional categories
}

interface FoodcourtCategory {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
}

interface TableInfo {
  id: string;
  tableNumber: string;
  capacity: number;
  isAvailable: boolean;
  activeSession: {
    id: string;
    sessionStart: string;
  } | null;
  hasActiveOrder: boolean;
}

export default function TablePage() {
  const params = useParams();
  const tableId = params.id as string;

  const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFoodcourts, setFilteredFoodcourts] = useState<Foodcourt[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Load cart item count
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const itemCount = cart.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      setCartItemCount(itemCount);
    }
  }, []);

  // Fetch table information
  useEffect(() => {
    async function fetchTableInfo() {
      try {
        const response = await fetch(`/api/public/tables/${tableId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch table information");
        }

        const data = await response.json();
        console.log("Table Info:", data);
        console.log("Table Info:", data);
        setTableInfo(data);

        // If there is an active order, check for new orders every 30 seconds
        if (data.hasActiveOrder) {
          const intervalId = setInterval(() => {
            fetchTableInfo();
          }, 30000); // 30 seconds

          return () => clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Error fetching table info:", err);
        // We won't set an error state here as the foodcourt list is more important
      }
    }

    if (tableId) {
      fetchTableInfo();
    }
  }, [tableId]);

  // Store table ID in localStorage and fetch foodcourts
  useEffect(() => {
    if (tableId) {
      localStorage.setItem("tableId", tableId);
    }

    async function fetchFoodcourts() {
      try {
        setLoading(true);
        const response = await fetch("/api/public/foodcourt");

        if (!response.ok) {
          throw new Error("Failed to fetch foodcourts");
        }

        const data = await response.json();
        console.log("Foodcourts data:", data);

        // Add the Pexels image URL to all foodcourts
        const updatedData = data.map((fc: Foodcourt) => ({
          ...fc,
          logo: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg",
        }));

        console.log("Foodcourts data:", data);

        // Add the Pexels image URL to all foodcourts
        const updatedData = data.map((fc: Foodcourt) => ({
          ...fc,
          logo: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg",
        }));

        // Fetch categories for each foodcourt
        const foodcourtsWithCategories = await Promise.all(
          updatedData.map(async (foodcourt: Foodcourt) => {
          updatedData.map(async (foodcourt: Foodcourt) => {
            try {
              const categoryResponse = await fetch(
                `/api/public/foodcourt/${foodcourt.id}/categories`,
              );

              const categoryResponse = await fetch(
                `/api/public/foodcourt/${foodcourt.id}/categories`,
              );

              if (categoryResponse.ok) {
                const categories = await categoryResponse.json();
                return { ...foodcourt, categories };
              }


              return foodcourt;
            } catch (err) {
              console.error(
                `Error fetching categories for foodcourt ${foodcourt.id}:`,
                err,
              );
              console.error(
                `Error fetching categories for foodcourt ${foodcourt.id}:`,
                err,
              );
              return foodcourt;
            }
          }),
          }),
        );

        // Log to check if logos are present in the data
        foodcourtsWithCategories.forEach((fc: Foodcourt) => {
          console.log(
            `Foodcourt ${fc.name} has logo: ${fc.logo ? "Yes" : "No"}`,
          );
        });


        // Log to check if logos are present in the data
        foodcourtsWithCategories.forEach((fc: Foodcourt) => {
          console.log(
            `Foodcourt ${fc.name} has logo: ${fc.logo ? "Yes" : "No"}`,
          );
        });

        setFoodcourts(foodcourtsWithCategories);
        setFilteredFoodcourts(foodcourtsWithCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchFoodcourts();
  }, [tableId]);

  // Filter foodcourts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFoodcourts(foodcourts);
    } else {
      const filtered = foodcourts.filter(
        (foodcourt) =>
          foodcourt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (foodcourt.description &&
            foodcourt.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          // Also search by category names
          (foodcourt.categories &&
            foodcourt.categories.some((category) =>
              category.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )),
            foodcourt.categories.some((category) =>
              category.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )),
      );
      setFilteredFoodcourts(filtered);
    }
  }, [searchQuery, foodcourts]);

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  // Loading state
  if (loading && foodcourts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  // Error state
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
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Table Info Banner */}
      <div
        className="p-20 text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg font-medium">
            Table #{tableInfo?.tableNumber || tableId}
          </span>
          {tableInfo?.hasActiveOrder && (
            <span className="mt-1 rounded-full bg-green-200 px-2 py-0.5 text-sm text-green-800">
            <span className="mt-1 rounded-full bg-green-200 px-2 py-0.5 text-sm text-green-800">
              Order in progress
            </span>
          )}
          {tableInfo?.activeSession && (
            <span className="mt-1 text-xs">
              Session started:{" "}
              {new Date(
                tableInfo.activeSession.sessionStart,
              ).toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="text-bold mt-1">Pesanan Kamu Akan Dikirim ke Sini</p>
        <p className="text-bold mt-1">Pesanan Kamu Akan Dikirim ke Sini</p>
      </div>
      {/* Search - Diletakkan setelah banner */}
      <div className="relative z-10 mx-auto -mt-10 max-w-2xl p-5">
        <div className="relative">
          <Input
            placeholder="lagi mau makan apa?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-200 pl-10 shadow-lg"
          />
          <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1.5 right-1 h-5 w-6"
              className="absolute top-1.5 right-1 h-5 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {/* Foodcourt List */}
      <div className="mx-auto max-w-4xl space-y-4 px-4">
        {filteredFoodcourts.length > 0 ? (
          filteredFoodcourts.map((foodcourt) => (
            <div
            <div
              key={foodcourt.id}
              className="relative rounded-xl bg-green-600 pb-4 shadow-md"
            >
              <Link
                href={`/table/${tableId}/foodcourt/${foodcourt.id}`}
                className="block"
              >
                <Card className="overflow-hidden bg-white transition-shadow hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex items-center">
                      <div className="ml-4 h-24 w-24 flex-shrink-0 overflow-hidden border-2 border-solid bg-gray-200">
                        {foodcourt.logo &&
                        foodcourt.logo.trim() !== "" &&
                        !imgErrors[foodcourt.id] ? (
                          // Menggunakan next/image untuk optimasi
                          <div className="sticky">
                            <Image
                              src={foodcourt.logo}
                              alt={foodcourt.name}
                              width={96}
                              height={96}
                              className="h-28 w-30 object-cover"
                              onError={() => handleImageError(foodcourt.id)}
                              unoptimized={!foodcourt.logo.startsWith("/")}
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 items-center p-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{foodcourt.name}</h3>
                            {/* Status Badge */}
                            <Badge
                              className={`ml-2 flex items-center ${
                                foodcourt.status === "BUKA"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }`}
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {foodcourt.status === "BUKA" ? "Buka" : "Tutup"}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                            {foodcourt.description ||
                              "No description available"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {foodcourt.address || "Address not available"}
                          </p>

                          {/* Display Foodcourt Categories */}
                          {foodcourt.categories &&
                            foodcourt.categories.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {foodcourt.categories
                                  .slice(0, 3)
                                  .map((category) => (
                                    <Badge
                                      key={category.id}
                                      variant="outline"
                                      className="bg-gray-100 text-xs"
                                    >
                                      <Tag className="mr-1 h-3 w-3" />
                                      {category.name}
                                    </Badge>
                                  ))}
                                {foodcourt.categories.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="bg-gray-100 text-xs"
                                  >
                                    +{foodcourt.categories.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>
                        <ArrowRight className="text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              {searchQuery
                ? `No foodcourts found matching "${searchQuery}"`
                : "No foodcourts available at the moment."}
            </p>
            {searchQuery && (
              <Button className="mt-4" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </Card>
        )}
      </div>
      {/* Cart Button (if items in cart) */}
      {cartItemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white px-4 py-3 shadow-md">
          <Link href="/cart">
            <Button className="w-full bg-green-500 text-white hover:bg-green-600">
              View Cart ({cartItemCount}{" "}
              {cartItemCount === 1 ? "item" : "items"})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}


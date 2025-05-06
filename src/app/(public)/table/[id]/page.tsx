// ~/src/app/(public)/table/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Search } from "lucide-react";

// Define types
enum CategoryType {
  MAKANAN_UTAMA = "MAKANAN_UTAMA",
  MINUMAN = "MINUMAN",
  CEMILAN = "CEMILAN",
  MAKANAN_MANIS = "MAKANAN_MANIS",
}

enum FoodcourtStatus {
  BUKA = "BUKA",
  TUTUP = "TUTUP",
}

type Foodcourt = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  image: string | null;
  imagePublicId: string | null;
  status: FoodcourtStatus;
  category: CategoryType | null;
};

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

const categoryLabels = {
  [CategoryType.MAKANAN_UTAMA]: "Makanan Utama",
  [CategoryType.MINUMAN]: "Minuman",
  [CategoryType.CEMILAN]: "Jajanan",
  [CategoryType.MAKANAN_MANIS]: "Manisan",
};

const statusLabels = {
  [FoodcourtStatus.BUKA]: "OPEN",
  [FoodcourtStatus.TUTUP]: "CLOSED",
};

export default function FoodcourtsPage() {
  const router = useRouter();
  const { id: tableId } = useParams();
  const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
  const [filteredFoodcourts, setFilteredFoodcourts] = useState<Foodcourt[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

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
      localStorage.setItem("tableId", tableId as string);
    }
  }, [tableId]);

  // Fetch foodcourts data
  useEffect(() => {
    const fetchFoodcourts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/public/foodcourt");

        if (!response.ok) {
          throw new Error("Failed to fetch foodcourts");
        }

        const data = await response.json();
        console.log("Foodcourts data:", data);
        setFoodcourts(data);
        setFilteredFoodcourts(data);
      } catch (err) {
        setError("Error loading foodcourts. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodcourts();
  }, []);

  // Filter foodcourts based on selected categories and search query
  useEffect(() => {
    let filtered = [...foodcourts];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (foodcourt) =>
          foodcourt.category && selectedCategories.includes(foodcourt.category),
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (foodcourt) =>
          foodcourt.name.toLowerCase().includes(query) ||
          (foodcourt.description &&
            foodcourt.description.toLowerCase().includes(query)) ||
          foodcourt.address.toLowerCase().includes(query),
      );
    }

    setFilteredFoodcourts(filtered);
  }, [selectedCategories, foodcourts, searchQuery]);

  // Toggle category selection
  const toggleCategory = (category: CategoryType) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  // Navigate to foodcourt menu page
  const navigateToFoodcourtMenu = (foodcourtId: string) => {
    router.push(`/table/${tableId}/foodcourt/${foodcourtId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Stand-stand</h1>
          {tableInfo && (
            <div className="mb-2 inline-block rounded-lg bg-blue-50 px-3 py-1 text-blue-700">
              Table #{tableInfo.tableNumber}
            </div>
          )}
          <p className="text-gray-600">
            Jelajahi menu pilihan mu
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search by name, description or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-gray-800">
            Filter Kategori
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(CategoryType).map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Menunjukkan {filteredFoodcourts.length} dari {foodcourts.length}{" "}
            Stand
            {selectedCategories.length > 0 && (
              <span>
                {" "}
                berdasarkan {" "}
                {selectedCategories.map((c) => categoryLabels[c]).join(", ")}
              </span>
            )}
            {searchQuery.trim() !== "" && (
              <span> matching "{searchQuery.trim()}"</span>
            )}
          </p>
        </div>

        {/* Foodcourts Grid */}
        {filteredFoodcourts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFoodcourts.map((foodcourt) => (
              <div
                key={foodcourt.id}
                className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                onClick={() => navigateToFoodcourtMenu(foodcourt.id)}
              >
                <div className="relative h-48">
                  {foodcourt.image ? (
                    <Image
                      src={foodcourt.image}
                      alt={foodcourt.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        foodcourt.status === FoodcourtStatus.BUKA
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {statusLabels[foodcourt.status]}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    {foodcourt.name}
                  </h3>
                  <p className="mb-3 text-sm text-gray-500">
                    {foodcourt.address}
                  </p>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {foodcourt.description}
                  </p>

                  {foodcourt.category && (
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        {categoryLabels[foodcourt.category]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              Stand yang kamu cari tidak tersedia :(
            </h3>
            <p className="text-gray-500">
              Coba dengan filter lain yaa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

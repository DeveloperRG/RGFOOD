"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { UtensilsIcon, QrCodeIcon, TruckIcon, Loader2 } from "lucide-react";

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  qrCode: string | null;
  isAvailable: boolean;
  activeSession: {
    id: string;
    sessionStart: string;
  } | null;
  hasActiveOrder: boolean;
  activeOrders:
    | {
        id: string;
        status: string;
        createdAt: string;
      }[]
    | null;
}

interface TablesResponse {
  tables: Table[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

const popularFoodcourts = [
  { id: "1", name: "Asian Delights", cuisine: "Pan-Asian", rating: 4.7 },
  { id: "2", name: "Italian Corner", cuisine: "Italian", rating: 4.5 },
  { id: "3", name: "Spice Garden", cuisine: "Indian", rating: 4.6 },
];

export default function HomePage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tables from the API
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/public/tables");

        if (!response.ok) {
          throw new Error("Failed to fetch tables");
        }

        const data: TablesResponse = await response.json();
        setTables(data.tables);
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError("Failed to load tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Function to handle table selection and redirect
  const handleTableSelection = (tableId: string) => {
    router.push(`/table/${tableId}`);
  };

  return (
    <div className="min-h-screen items-center bg-gray-50">
      {/* Hero Section */}
      <div className="items-center justify-center bg-green-600 to-indigo-700 text-white">
        <div className="container mx-auto items-center px-4 py-20">
          <div className="content-center">
            <div className="content-center space-y-6">
              <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                Makanan yang Enak, <br />
                <span className="text-yellow-300">Pesan ke Meja Anda</span>
              </h1>
              <p className="text-lg md:text-xl">
                Cari, pesan, and nikmati makanan minuman yang kami sediakan
              </p>
              <div
                className="flex flex-wrap gap-4 rounded-lg p-6"
                style={{
                  backgroundImage:
                    'url("https://example.com/green-background.jpg")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Link
                  href="#table-selection"
                  className="inline-flex items-center rounded-full bg-white px-6 py-3 font-medium text-green-700 shadow-lg transition-all hover:bg-yellow-300"
                >
                  Pilih Meja
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center rounded-full border border-white px-6 py-3 font-medium text-white transition-all hover:bg-white hover:text-blue-700"
                >
                  Bagaimana ini Kerja
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden"></div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Bagaimana ini Bekerja
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Three simple steps to enjoy a seamless dining experience
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105">
              <div className="mb-5 inline-flex rounded-full bg-blue-100 p-4">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Scan QR Code</h3>
              <p className="text-gray-600">
                Each table has a unique QR code that identifies your location
                and lets you place orders directly.
              </p>
              <div className="mt-6 flex justify-between text-sm">
                <span className="font-medium text-blue-600">Step 1</span>
                <span className="text-gray-400">Takes 5 seconds</span>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105">
              <div className="mb-5 inline-flex rounded-full bg-blue-100 p-4">
                <UtensilsIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Browse & Order</h3>
              <p className="text-gray-600">
                Explore menus from multiple foodcourts, customize your orders,
                and pay securely online.
              </p>
              <div className="mt-6 flex justify-between text-sm">
                <span className="font-medium text-blue-600">Step 2</span>
                <span className="text-gray-400">Simple interface</span>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105">
              <div className="mb-5 inline-flex rounded-full bg-blue-100 p-4">
                <TruckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Enjoy Delivery</h3>
              <p className="text-gray-600">
                Track your order in real-time and enjoy your food when it
                arrives directly to your table.
              </p>
              <div className="mt-6 flex justify-between text-sm">
                <span className="font-medium text-blue-600">Step 3</span>
                <span className="text-gray-400">Fast delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Foodcourts Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Popular Foodcourts
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover trending eateries loved by our customers
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {popularFoodcourts.map((foodcourt) => (
                <div
                  key={foodcourt.id}
                  className="overflow-hidden rounded-xl bg-white shadow-lg"
                >
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-bold">{foodcourt.name}</h3>
                      <div className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800">
                        ★ {foodcourt.rating}
                      </div>
                    </div>
                    <p className="mb-4 text-gray-600">
                      {foodcourt.cuisine} Cuisine
                    </p>
                    <Link
                      href={`/foodcourt/${foodcourt.id}`}
                      className="inline-flex items-center text-blue-600 hover:underline"
                    >
                      View Menu
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Selection Section */}
      <div id="table-selection" className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800">
            Test Mode
          </span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-gray-900">
            Select a Table
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            For testing purposes, select one of our tables below to simulate
            scanning a QR code
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-600">
                  Loading available tables...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-red-100 px-6 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelection(table.id)}
                  disabled={!table.isAvailable}
                  className={`flex flex-col items-center rounded-xl p-6 text-center transition-all hover:scale-105 ${
                    table.isAvailable
                      ? "bg-white shadow-md hover:shadow-xl"
                      : "cursor-not-allowed bg-gray-100 opacity-70"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                      table.hasActiveOrder ? "bg-yellow-50" : "bg-blue-50"
                    }`}
                  >
                    <span
                      className={`text-2xl font-bold ${
                        table.hasActiveOrder
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {table.tableNumber}
                    </span>
                  </div>
                  <span className="mt-2 font-medium">
                    Table {table.tableNumber}
                  </span>
                  <div className="mt-2 text-sm text-gray-500">
                    Capacity: {table.capacity} persons
                  </div>
                  <span
                    className={`mt-1 text-xs ${
                      table.isAvailable
                        ? table.hasActiveOrder
                          ? "text-yellow-600"
                          : "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {table.isAvailable
                      ? table.hasActiveOrder
                        ? "Active Order"
                        : "Available"
                      : "Not Available"}
                  </span>
                  {table.activeSession && (
                    <span className="mt-1 text-xs text-blue-500">
                      Session Active
                    </span>
                  )}
                </button>
              ))}

              {/* Add a fallback when no tables are available */}
              {tables.length === 0 && !error && !loading && (
                <div className="col-span-full py-8 text-center">
                  <p className="text-gray-500">
                    No tables are currently available.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Make sure you've added tables to your database or try
                    refreshing the page.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR Code explanation for testing */}
        <div className="mx-auto mt-12 max-w-4xl rounded-lg bg-blue-50 p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-3">
              <QrCodeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Testing Information
              </h3>
              <p className="mt-2 text-blue-800">
                In a real implementation, customers would scan a QR code located
                on their table which would automatically direct them to
                <code className="mx-1 rounded bg-blue-100 px-1 py-0.5 text-sm">
                  yourdomain.com/table/[tableId]
                </code>
              </p>
              <p className="mt-2 text-blue-800">
                This page simulates that process by letting you click on a table
                instead of scanning a QR code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Ready to experience convenient dining?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Join thousands of satisfied customers who enjoy hassle-free dining
            with FoodCourt Hub
          </p>
          <Link
            href="#table-selection"
            className="inline-flex items-center rounded-full bg-white px-8 py-3 font-medium text-blue-700 shadow-lg transition-all hover:bg-yellow-300"
          >
            Select a Table Now
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

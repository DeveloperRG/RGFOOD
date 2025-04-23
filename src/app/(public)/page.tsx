// src/app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import { UtensilsIcon, QrCodeIcon, TruckIcon } from "lucide-react";

const dummyTables = [
  { id: "1", tableNumber: 1, status: "Available" },
  { id: "2", tableNumber: 2, status: "Available" },
  { id: "3", tableNumber: 3, status: "Available" },
  { id: "4", tableNumber: 4, status: "Reserved" },
  { id: "5", tableNumber: 5, status: "Available" },
  { id: "6", tableNumber: 6, status: "Available" },
];

const popularFoodcourts = [
  { id: "1", name: "Asian Delights", cuisine: "Pan-Asian", rating: 4.7 },
  { id: "2", name: "Italian Corner", cuisine: "Italian", rating: 4.5 },
  { id: "3", name: "Spice Garden", cuisine: "Indian", rating: 4.6 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                Delicious food, <br />
                <span className="text-yellow-300">delivered to your table</span>
              </h1>
              <p className="text-lg md:text-xl">
                Browse, order, and enjoy meals from multiple foodcourts without
                leaving your seat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/explore"
                  className="inline-flex items-center rounded-full bg-white px-6 py-3 font-medium text-blue-700 shadow-lg transition-all hover:bg-yellow-300"
                >
                  Explore Menus
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center rounded-full border border-white px-6 py-3 font-medium text-white transition-all hover:bg-white hover:text-blue-700"
                >
                  How It Works
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                <Image
                  src="/api/placeholder/600/500"
                  alt="Food Court Experience"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <UtensilsIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">20+ Foodcourts</p>
                    <p className="text-sm text-gray-500">All in one platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-full fill-gray-50 md:h-24"
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
          </svg>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            How It Works
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
                  <div className="relative h-48">
                    <Image
                      src={`/api/placeholder/400/300`}
                      alt={foodcourt.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
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
      <div className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800">
            Test Mode
          </span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-gray-900">
            Select a Table
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            For testing purposes, select one of our virtual tables below
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {dummyTables.map((table) => (
              <Link
                href={`/table/${table.id}`}
                key={table.id}
                className={`flex flex-col items-center rounded-xl p-6 text-center transition-all hover:scale-105 ${
                  table.status === "Available"
                    ? "bg-white shadow-md hover:shadow-xl"
                    : "bg-gray-100 opacity-70"
                }`}
                aria-disabled={table.status !== "Available"}
              >
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">
                    {table.tableNumber}
                  </span>
                </div>
                <span className="mt-2 font-medium">
                  Table {table.tableNumber}
                </span>
                <span
                  className={`mt-1 text-xs ${
                    table.status === "Available"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {table.status}
                </span>
              </Link>
            ))}
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
            href="/register"
            className="inline-flex items-center rounded-full bg-white px-8 py-3 font-medium text-blue-700 shadow-lg transition-all hover:bg-yellow-300"
          >
            Get Started Now
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
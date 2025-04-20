// src/app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";


const dummyTables = [
  { id: "1", tableNumber: 1 },
  { id: "2", tableNumber: 2 },
  { id: "3", tableNumber: 3 },
  { id: "4", tableNumber: 4 },
  { id: "5", tableNumber: 5 },
];

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to FoodCourt Hub
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          Order delicious food from multiple foodcourts, all from the comfort of
          your table.
        </p>
      </div>

      <div className="mx-auto mb-12 max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="relative h-64 sm:h-80">
          <Image
            src="/api/placeholder/1200/800"
            alt="Food Court Banner"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">How It Works</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold">Scan your table's QR code</h3>
              <p className="text-gray-600">
                Each table has a unique QR code that identifies your location
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold">Browse multiple menus</h3>
              <p className="text-gray-600">
                Choose from various foodcourts and their delicious offerings
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="font-bold text-blue-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold">Place your order</h3>
              <p className="text-gray-600">
                Your food will be prepared and delivered straight to your table
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-center text-2xl font-bold">
          For testing: Select a table
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {dummyTables.map((table) => (
            <Link
              href={`/table/${table.id}`}
              key={table.id}
              className="rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
            >
              <span className="text-xl font-bold text-blue-600">
                Table {table.tableNumber}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

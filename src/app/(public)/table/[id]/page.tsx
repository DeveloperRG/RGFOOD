// src/app/(public)/table/[tableId]/page.tsx
import Link from "next/link";
import Image from "next/image";

// Dummy data for available foodcourts
const dummyFoodcourts = [
  {
    id: "fc1",
    name: "Asian Delights",
    description: "Authentic Asian cuisine from various regions",
    image: "/api/placeholder/400/300",
  },
  {
    id: "fc2",
    name: "Burger Paradise",
    description: "Juicy burgers and crispy fries",
    image: "/api/placeholder/400/300",
  },
  {
    id: "fc3",
    name: "Pizza Haven",
    description: "Traditional Italian pizzas baked in wood-fired ovens",
    image: "/api/placeholder/400/300",
  },
  {
    id: "fc4",
    name: "Healthy Bites",
    description: "Nutritious and delicious health-focused meals",
    image: "/api/placeholder/400/300",
  },
];

export default function TablePage({ params }: { params: { tableId: string } }) {
  const { tableId } = params;

  // In a real application, you would fetch the table data and available foodcourts

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Table {tableId}
        </h1>
        <p className="text-lg text-gray-600">
          Select a foodcourt to browse their menu and place your order.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyFoodcourts.map((foodcourt) => (
          <Link
            href={`/table/${tableId}/foodcourt/${foodcourt.id}`}
            key={foodcourt.id}
            className="block"
          >
            <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
              <div className="relative h-48">
                <Image
                  src={foodcourt.image}
                  alt={foodcourt.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="mb-2 text-xl font-bold">{foodcourt.name}</h2>
                <p className="text-gray-600">{foodcourt.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

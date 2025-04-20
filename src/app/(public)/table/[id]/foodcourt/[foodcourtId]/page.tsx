// src/app/(public)/table/[tableId]/foodcourt/[foodcourtId]/page.tsx
import Link from "next/link";
import Image from "next/image";

// Dummy data for menu categories
const dummyCategories = [
  {
    id: "cat1",
    name: "Appetizers",
    displayOrder: 1,
  },
  {
    id: "cat2",
    name: "Main Courses",
    displayOrder: 2,
  },
  {
    id: "cat3",
    name: "Desserts",
    displayOrder: 3,
  },
  {
    id: "cat4",
    name: "Beverages",
    displayOrder: 4,
  },
];

// Dummy data for menu items
const dummyMenuItems = [
  {
    id: "item1",
    name: "Spring Rolls",
    description: "Crispy spring rolls filled with vegetables",
    price: 5.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat1",
    isAvailable: true,
  },
  {
    id: "item2",
    name: "Fried Chicken Wings",
    description: "Crispy fried chicken wings with special sauce",
    price: 8.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat1",
    isAvailable: true,
  },
  {
    id: "item3",
    name: "Beef Noodles",
    description: "Savory beef noodles with rich broth",
    price: 12.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat2",
    isAvailable: true,
  },
  {
    id: "item4",
    name: "Vegetable Curry",
    description: "Aromatic vegetable curry with rice",
    price: 11.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat2",
    isAvailable: true,
  },
  {
    id: "item5",
    name: "Mango Sticky Rice",
    description: "Sweet sticky rice with fresh mango",
    price: 6.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat3",
    isAvailable: true,
  },
  {
    id: "item6",
    name: "Ice Cream",
    description: "Vanilla ice cream with chocolate sauce",
    price: 4.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat3",
    isAvailable: true,
  },
  {
    id: "item7",
    name: "Thai Iced Tea",
    description: "Sweet and creamy Thai iced tea",
    price: 3.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat4",
    isAvailable: true,
  },
  {
    id: "item8",
    name: "Fresh Fruit Smoothie",
    description: "Refreshing smoothie made with seasonal fruits",
    price: 4.99,
    imageUrl: "/api/placeholder/300/200",
    categoryId: "cat4",
    isAvailable: true,
  },
];

// Dummy foodcourt data
const dummyFoodcourts = {
  fc1: {
    id: "fc1",
    name: "Asian Delights",
    description: "Authentic Asian cuisine from various regions",
    image: "/api/placeholder/800/400",
  },
  fc2: {
    id: "fc2",
    name: "Burger Paradise",
    description: "Juicy burgers and crispy fries",
    image: "/api/placeholder/800/400",
  },
  fc3: {
    id: "fc3",
    name: "Pizza Haven",
    description: "Traditional Italian pizzas baked in wood-fired ovens",
    image: "/api/placeholder/800/400",
  },
  fc4: {
    id: "fc4",
    name: "Healthy Bites",
    description: "Nutritious and delicious health-focused meals",
    image: "/api/placeholder/800/400",
  },
};

export default function FoodcourtPage({
  params,
}: {
  params: { tableId: string; foodcourtId: string };
}) {
  const { tableId, foodcourtId } = params;

  // In a real application, you would fetch the foodcourt data and its menu items
  const foodcourt =
    dummyFoodcourts[foodcourtId as keyof typeof dummyFoodcourts];

  // Group menu items by category
  const categorizedItems = dummyCategories.map((category) => {
    const items = dummyMenuItems.filter(
      (item) => item.categoryId === category.id,
    );
    return {
      ...category,
      items,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/table/${tableId}`}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Foodcourts
        </Link>

        <div className="relative mb-4 h-60 overflow-hidden rounded-lg">
          <Image
            src={foodcourt.image}
            alt={foodcourt.name}
            fill
            className="object-cover"
          />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {foodcourt.name}
        </h1>
        <p className="mb-4 text-lg text-gray-600">{foodcourt.description}</p>
      </div>

      {categorizedItems.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {category.name}
            </h2>
            <Link
              href={`/table/${tableId}/foodcourt/${foodcourtId}/category/${category.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg bg-white shadow-md"
              >
                <div className="relative h-40">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <span className="text-lg font-semibold text-green-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mb-4 text-gray-600">{item.description}</p>
                  <button className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

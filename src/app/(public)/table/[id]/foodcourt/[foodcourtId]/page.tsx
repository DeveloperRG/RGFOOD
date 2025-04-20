'use client';

import { useState } from 'react';
import Image from 'next/image';

// Food item interface
interface FoodItem {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

// Component for rendering a single food item card
const FoodCard = ({ item }: { item: FoodItem }) => {
  return (
    <div className="bg-yellow-100 rounded-xl p-4 relative flex flex-col items-center">
      <div className="relative w-full h-36 mb-2 overflow-hidden rounded-lg">
        <Image 
          src={item.image} 
          alt={item.name} 
          fill 
          className="object-cover rounded-lg"
        />
      </div>
      <div className="w-full text-center">
        <h3 className="text-sm font-medium">{item.name}</h3>
        <p className="text-sm">Rp. {item.price.toLocaleString()}</p>
        <div className="flex items-center justify-center mt-1">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="text-xs">{item.rating.toFixed(1)}</span>
        </div>
      </div>
      <button className="absolute bottom-4 right-4 bg-white p-1 rounded-md shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

// Main page component
export default function MenuPage() {
  // Sample food data
  const foodItems: FoodItem[] = [
    {
      id: 1,
      name: "Nasi Goreng Special",
      price: 25.000,
      rating: 4.9,
      image: "/nasi-goreng-1.jpg",
      category: "Nasi Goreng"
    },
    {
      id: 2,
      name: "Mie Goreng Pedas",
      price: 23.000,
      rating: 4.9,
      image: "/mie-goreng-1.jpg",
      category: "Mie Goreng"
    },
    {
      id: 3,
      name: "Nasi Goreng Seafood",
      price: 30.000,
      rating: 4.9,
      image: "/nasi-goreng-2.jpg",
      category: "Nasi Goreng"
    },
    {
      id: 4,
      name: "Mie Goreng Ayam",
      price: 22.000,
      rating: 4.9,
      image: "/mie-goreng-2.jpg",
      category: "Mie Goreng"
    },
    {
      id: 5,
      name: "Nasi Goreng Kambing",
      price: 35.000,
      rating: 4.9,
      image: "/nasi-goreng-3.jpg",
      category: "Nasi Goreng"
    },
    {
      id: 6,
      name: "Cappuccino Special",
      price: 18.000,
      rating: 4.9,
      image: "/cappuccino-1.jpg",
      category: "Cappuccino"
    },
  ];

  // Categories
  const categories = ["Popular", "Nasi Goreng", "Mie Goreng", "Cappuccino"];
  const [activeCategory, setActiveCategory] = useState("Popular");

  // Filter foods by category
  const filteredFoods = activeCategory === "Popular" 
    ? foodItems.filter((item, index) => index < 6)
    : foodItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button, search, and cart */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button className="p-2 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex space-x-4">
            <button className="p-2 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-100 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-6 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Restaurant profile */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 relative mb-3">
            <Image 
              src="/restaurant-logo.jpg"
              alt="Restaurant Logo"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h1 className="text-xl font-bold text-center">Coffe Memek</h1>
          <p className="text-sm text-gray-500 text-center">Deskripsi tentang stand</p>
        </div>

        {/* Category tabs */}
        <div className="mb-6  overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Food grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 m-auto">
          {filteredFoods.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
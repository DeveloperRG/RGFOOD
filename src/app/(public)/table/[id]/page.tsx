'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Utensils, CakeSlice, Coffee, Croissant} from "lucide-react";

// Interface for our data
interface FoodStand {
  id: number;
  name: string;
  type: string[];
  rating: number;
  image: string;
}

// Sample data for food stands
const popularStands: FoodStand[] = [
  {
    id: 1,
    name: 'Coffe Payakumbuh',
    type: ['Jajanan'],
    rating: 4.9,
    image: '/popular-stand-1.jpg'
  },
  {
    id: 2,
    name: 'Penjualan Kue Menek',
    type: ['Jajanan'],
    rating: 4.9,
    image: '/popular-stand-2.jpg'
  }
];

// Sample data for other stands
const otherStands: FoodStand[] = [
  {
    id: 3,
    name: 'Nama Stand',
    type: ['Minuman', 'roti'],
    rating: 4.9,
    image: '/stand-1.jpg'
  },
  {
    id: 4,
    name: 'Nama Stand',
    type: ['Minuman', 'roti'],
    rating: 4.9,
    image: '/stand-2.jpg'
  },
  {
    id: 5,
    name: 'Nama Stand',
    type: ['Minuman', 'roti'],
    rating: 4.9,
    image: '/stand-3.jpg'
  }
];

export default function DaftarStand() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Daftar Stand</h1>
        <div className="flex items-center">
          <button className="bg-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-4 relative flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari Stand"
              className="pl-10 pr-4 py-2 w-full rounded-full bg-lime-100 border-0 focus:ring-2 focus:ring-lime-300 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="ml-2 p-2 bg-lime-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>

        {/* Categories Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Aneka Kuliner</h2>
            <a href="#" className="text-sm text-gray-600 flex items-center">
              Lihat Semua
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          {/* Category Icons */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <div className="flex flex-col items-center bg-lime-500 rounded-lg">
              <div className="bg-lime-500 p-8 rounded-lg mb-1 relative">
                <div className="bg-lime-500 rounded-lg absolute inset-0 opacity-50"></div>
                <div className="relative z-10 flex justify-center">
                  <Utensils size={56}/>
                </div>
              </div>
              <span className="text-base text- mb-4">Semua</span>
            </div>
            
            <div className="flex flex-col items-center bg-lime-500 rounded-lg">
              <div className="bg-lime-500 p-8 rounded-lg mb-1">
                <CakeSlice size={56}/>
              </div>
              <span className="text-base text-center">Jajanan</span>
            </div>
            
            <div className="flex flex-col items-center bg-lime-500 rounded-lg">
              <div className="bg-lime-500 p-8 rounded-lg mb-1">
                <Coffee size={56}/>
              </div>
              <span className="text-base text-center">Minuman</span>
            </div>
            
            <div className="flex flex-col items-center bg-lime-500 rounded-lg">
              <div className="bg-lime-500 p-8 rounded-lg mb-1">
                <Croissant size={56}/>
              </div>
              <span className="text-base text-center">Roti</span>
            </div>
          </div>
        </section>

        {/* Popular Stands */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Sering Dikunjungi</h2>
            <a href="#" className="text-sm text-gray-600 flex items-center">
              Lihat Semua
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularStands.map((stand) => (
              <div key={stand.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="relative h-40 w-full">
                  <div className="absolute inset-0 bg-gray-300">
                    {/* Replace with actual Image component when you have real images */}
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">Image</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{stand.name}</h3>
                  <p className="text-sm text-gray-500">{stand.type.join(', ')}</p>
                  <div className="flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm ml-1">{stand.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Stands */}
        <section>
          {otherStands.map((stand) => (
            <div key={stand.id} className="bg-lime-100 rounded-lg p-3 mb-4 flex items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-lg mr-3 flex-shrink-0">
                {/* Replace with actual Image component when you have real images */}
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">Image</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{stand.name}</h3>
                <p className="text-sm text-gray-600">{stand.type.join(', ')}</p>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm ml-1">{stand.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
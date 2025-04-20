// src/app/(public)/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Dummy cart data
const initialCartItems = [
  {
    id: "1",
    name: "Spring Rolls",
    price: 5.99,
    quantity: 2,
    foodcourt: "Asian Delights",
    foodcourtId: "fc1",
    imageUrl: "/api/placeholder/100/100",
  },
  {
    id: "2",
    name: "Beef Noodles",
    price: 12.99,
    quantity: 1,
    foodcourt: "Asian Delights",
    foodcourtId: "fc1",
    imageUrl: "/api/placeholder/100/100",
  },
  {
    id: "3",
    name: "Cheeseburger",
    price: 8.99,
    quantity: 1,
    foodcourt: "Burger Paradise",
    foodcourtId: "fc2",
    imageUrl: "/api/placeholder/100/100",
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [customerName, setCustomerName] = useState("");
  const [tableId, setTableId] = useState("table1"); // In a real app, this would come from context/state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Calculate subtotal for an item
  const getItemSubtotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  // Calculate total cart value
  const getTotal = () => {
    return cartItems.reduce(
      (total, item) => total + getItemSubtotal(item.price, item.quantity),
      0,
    );
  };

  // Group items by foodcourt
  const itemsByFoodcourt = cartItems.reduce(
    (acc, item) => {
      const foodcourtId = item.foodcourtId;
      if (!acc[foodcourtId]) {
        acc[foodcourtId] = {
          name: item.foodcourt,
          items: [],
        };
      }
      acc[foodcourtId].items.push(item);
      return acc;
    },
    {} as Record<string, { name: string; items: typeof cartItems }>,
  );

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // Handle order submission
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(true);
      // Clear cart
      setCartItems([]);
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Thank you, {customerName}! Your order has been received and is being
            processed. You'll receive a notification when it's ready.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Your Cart</h1>
          <div className="py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4 h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mb-8 text-lg text-gray-600">Your cart is empty</p>
            <Link
              href={`/table/${tableId}`}
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Cart</h1>

      <div className="mb-8">
        <Link
          href={`/table/${tableId}`}
          className="flex items-center text-blue-600 hover:text-blue-800"
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
          Continue Ordering
        </Link>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-2/3">
          {Object.entries(itemsByFoodcourt).map(([foodcourtId, foodcourt]) => (
            <div
              key={foodcourtId}
              className="mb-6 overflow-hidden rounded-lg bg-white shadow-md"
            >
              <div className="border-b bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {foodcourt.name}
                </h2>
              </div>

              <div className="divide-y">
                {foodcourt.items.map((item) => (
                  <div key={item.id} className="flex items-center px-6 py-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <span className="mx-3">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${getItemSubtotal(item.price, item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Order Summary
            </h2>

            <div className="mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="mb-2 flex justify-between">
                  <span className="text-gray-600">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${getItemSubtotal(item.price, item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="mt-4 border-t pt-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder}>
              <div className="mb-4">
                <label
                  htmlFor="customerName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !customerName}
                className={`w-full rounded-lg px-6 py-3 font-medium transition-colors ${
                  isSubmitting || !customerName
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                By placing your order, you agree to the Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

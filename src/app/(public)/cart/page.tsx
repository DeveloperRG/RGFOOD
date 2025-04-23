// src/app/(public)/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  } | null;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function CartPage({ params }: { params: { id: string } }) {
  const tableId = params.id;
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${tableId}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart from localStorage");
      }
    }
    
    // Load customer details if previously saved
    const savedCustomer = localStorage.getItem(`customer-${tableId}`);
    if (savedCustomer) {
      try {
        const customer = JSON.parse(savedCustomer);
        setCustomerName(customer.name || "");
        setCustomerPhone(customer.phone || "");
      } catch (e) {
        console.error("Failed to load customer details from localStorage");
      }
    }
  }, [tableId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`cart-${tableId}`, JSON.stringify(cart));
    
    // If cart is empty after an order is placed successfully, redirect back to foodcourts list
    if (cart.length === 0 && success) {
      setTimeout(() => {
        router.push(`/table/${tableId}`);
      }, 3000);
    }
  }, [cart, tableId, success, router]);

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + Number(item.item.price) * item.quantity,
    0
  );

  // Update item quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.item.id === id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.item.id !== id));
  };

  // Handle order submission
  const placeOrder = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!customerName) {
      setError("Please enter your name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Save customer details to localStorage
      localStorage.setItem(
        `customer-${tableId}`,
        JSON.stringify({ name: customerName, phone: customerPhone })
      );

      // Prepare order data
      const orderData = {
        tableId,
        customerName,
        customerPhone,
        specialInstructions,
        items: cart.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
          specialInstructions: "",
        })),
      };

      // Send order to API
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Order placed successfully
      setSuccess(true);
      setCart([]); // Clear cart
      localStorage.removeItem(`cart-${tableId}`);
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-10 bg-white p-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            className="rounded-full bg-gray-100 p-2"
            onClick={() => router.back()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Your Cart</h1>
          <div className="w-10"></div> {/* Empty div for balance */}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-20 pb-32">
        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
            <p className="font-medium">Order placed successfully!</p>
            <p className="mt-2 text-sm">
              Thank you for your order. You will be redirected back to the menu...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Empty Cart Message */}
        {cart.length === 0 && !success && (
          <div className="mt-10 rounded-lg bg-white p-6 text-center shadow-sm">
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
            <p className="mb-4 text-gray-600">
              Add items from the menu to get started with your order.
            </p>
            <button
              onClick={() => router.push(`/table/${tableId}`)}
              className="rounded-full bg-green-600 px-6 py-2 text-white"
            >
              Browse Menu
            </button>
          </div>
        )}

        {/* Cart Items */}
        {cart.length > 0 && (
          <>
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Order Items</h2>
              {cart.map((cartItem) => (
                <div
                  key={cartItem.item.id}
                  className="mb-4 flex items-center border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="relative mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    {cartItem.item.imageUrl ? (
                      <Image
                        src={cartItem.item.imageUrl}
                        alt={cartItem.item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-lg font-bold text-gray-500">
                          {cartItem.item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{cartItem.item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Rp. {Number(cartItem.item.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                      }
                      className="rounded-full bg-gray-100 p-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="mx-2 w-6 text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                      }
                      className="rounded-full bg-gray-100 p-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeItem(cartItem.item.id)}
                      className="ml-4 text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Information */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Any special requests"
                  rows={3}
                ></textarea>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="mb-2 flex justify-between">
                <span>Subtotal</span>
                <span>Rp. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="mb-2 flex justify-between text-gray-500">
                <span>Tax (included)</span>
                <span>Included</span>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rp. {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Order Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-between">
              <div>
                <p className="text-lg font-semibold">
                  Rp. {totalPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {cart.reduce((total, item) => total + item.quantity, 0)} items
                </p>
              </div>
              <button
                onClick={placeOrder}
                disabled={isSubmitting}
                className={`rounded-lg bg-green-600 px-6 py-3 font-medium text-white ${
                  isSubmitting ? "opacity-70" : ""
                }`}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
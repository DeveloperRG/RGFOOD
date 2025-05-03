"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const tableId = params?.id || params?.tableId;

  const [cartCount, setCartCount] = useState(0);

  // Function to get cart count from localStorage - memoize with useCallback
  const getCartCount = useCallback(() => {
    if (typeof window !== "undefined") {
      const cart = localStorage.getItem("cart");
      if (cart) {
        try {
          const cartData = JSON.parse(cart);
          const itemCount = cartData.items
            ? cartData.items.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0,
              )
            : 0;
          setCartCount(itemCount);
        } catch (err) {
          console.error("Error parsing cart data:", err);
        }
      } else {
        setCartCount(0);
      }
    }
  }, []); // No dependencies needed since it doesn't use any props or state

  // Update cart count on mount and when storage changes
  useEffect(() => {
    // Initial cart count
    getCartCount();

    // Add event listener for storage changes
    window.addEventListener("storage", getCartCount);

    return () => {
      window.removeEventListener("storage", getCartCount);
    };
  }, [getCartCount]); // Add getCartCount as a dependency

  // Only show cart elements if we have a tableId
  const showCart = !!tableId;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main>
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-8 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      {/* Footer with cart navigation button */}
      {showCart && cartCount > 0 && (
        <div className="fixed bottom-0 left-0 z-30 w-full bg-white p-4 shadow-md">
          <div className="mx-auto max-w-7xl">
            <Link
              href={`/table/${tableId}/cart`}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              View Cart ({cartCount} items)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

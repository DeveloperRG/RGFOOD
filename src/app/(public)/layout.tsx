"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const tableId = params?.id || params?.tableId;

  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Check if we're on the cart page
  const isCartPage = pathname?.includes("/cart");

  // Function to get cart count and total from localStorage - memoize with useCallback
  const getCartCount = useCallback(() => {
    if (typeof window !== "undefined") {
      const cart = localStorage.getItem("cart");
      if (cart) {
        try {
          const cartData = JSON.parse(cart);
          if (cartData.items && cartData.items.length > 0) {
            // Calculate total items
            const itemCount = cartData.items.reduce(
              (sum: number, item: any) => sum + item.quantity,
              0,
            );

            // Calculate total price
            const totalPrice = cartData.items.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0,
            );

            setCartCount(itemCount);
            setCartTotal(totalPrice);
          } else {
            setCartCount(0);
            setCartTotal(0);
          }
        } catch (err) {
          console.error("Error parsing cart data:", err);
          setCartCount(0);
          setCartTotal(0);
        }
      } else {
        setCartCount(0);
        setCartTotal(0);
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

      {/* Footer with cart navigation button - hide on cart page */}
      {showCart && cartCount > 0 && !isCartPage && (
        <div className="fixed bottom-0 left-0 z-30 w-full bg-white p-4 shadow-md">
          <div className="mx-auto max-w-7xl">
            <Link
              href={`/table/${tableId}/cart`}
              className="flex w-full items-center justify-between rounded-lg bg-blue-600 px-6 py-3 text-left font-medium text-white hover:bg-blue-700"
            >
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span>Lihat Keranjang</span>
              </div>
              <div className="flex flex-col items-end">
                <span>{cartCount} item</span>
                <span className="text-sm">
                  Rp {cartTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

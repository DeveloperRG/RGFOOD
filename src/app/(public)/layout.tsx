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
        <div className="fixed bottom-4 left-0 z-50 w-full px-4">
          <div className="mx-auto max-w-md md:max-w-xl lg:max-w-2xl">
            <Link
              href={`/table/${tableId}/cart`}
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white shadow-xl transition-all duration-300 hover:from-green-600 hover:to-green-700"
            >
              {/* Kiri: Ikon dan Label */}
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6" />
                <div className="text-base font-semibold">Lihat Keranjang</div>
              </div>

              {/* Kanan: Jumlah dan Total */}
              <div className="text-right">
                <div className="text-sm">{cartCount} item</div>
                <div className="text-sm font-semibold">
                  Rp {cartTotal.toLocaleString("id-ID")}
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

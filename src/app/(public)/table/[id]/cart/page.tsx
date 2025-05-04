// src/app/(public)/cart/page.tsx
"use client";

import { useParams } from "next/navigation";
import CartPage from "~/components/cart/cart";

export default function Cart() {
  const params = useParams();
  const tableId = params?.id || params?.tableId;

  // If no tableId is present, we should show an error or redirect
  if (!tableId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">
            No table ID found. Please scan a QR code to view your cart.
          </p>
        </div>
      </div>
    );
  }

  return <CartPage />;
}
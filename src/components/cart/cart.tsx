"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
} from "lucide-react";

type Foodcourt = {
  id: string;
  name: string;
};

// Define types (same as in FoodcourtMenuPage)
type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  foodcourtId: string;
  foodcourtName: string;
  specialInstructions?: string;
};

type Cart = {
  tableId: string;
  items: CartItem[];
};

// Type for grouped cart items by foodcourt
type GroupedCartItems = {
  [foodcourtId: string]: {
    foodcourtName: string;
    items: CartItem[];
    subtotal: number;
  };
};

interface TableInfo {
  id: string;
  tableNumber: string;
  capacity: number;
  isAvailable: boolean;
  activeSession: {
    id: string;
    sessionStart: string;
  } | null;
  hasActiveOrder: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  // TypeScript safety: ensure tableId is a string
  const tableId = typeof params?.id === "string" ? params.id : "";

  const [cart, setCart] = useState<Cart | null>(null);
  const [groupedItems, setGroupedItems] = useState<GroupedCartItems>({});
  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [selectedFoodcourt, setSelectedFoodcourt] = useState<string | null>(
    null,
  );

  // Calculate subtotal, tax, and total
  const subtotal =
    cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const taxRate = 0.1; // 10% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Group cart items by foodcourt
  useEffect(() => {
    if (!cart?.items.length) {
      setGroupedItems({});
      return;
    }

    const grouped: GroupedCartItems = {};

    cart.items.forEach((item) => {
      // FIX 1: Initialize the foodcourt entry if it doesn't exist
      if (!grouped[item.foodcourtId]) {
        grouped[item.foodcourtId] = {
          foodcourtName: item.foodcourtName,
          items: [],
          subtotal: 0,
        };
      }

      // FIX 2: Use non-null assertion since we just initialized it above if it didn't exist
      // Use non-null assertion operator since we've already checked and initialized it above
      grouped[item.foodcourtId]!.items.push(item);
      grouped[item.foodcourtId]!.subtotal += item.price * item.quantity;
    });

    setGroupedItems(grouped);

    // Auto-select the first foodcourt when there's only one
    const foodcourtIds = Object.keys(grouped);
    if (foodcourtIds.length > 0) {
      const firstFoodcourtId = foodcourtIds[0];

      if (foodcourtIds.length === 1) {
        // Only one foodcourt - select it
        setSelectedFoodcourt(firstFoodcourtId || null);
      } else if (foodcourtIds.length > 1 && !selectedFoodcourt) {
        // Multiple foodcourts and none selected - select the first one
        setSelectedFoodcourt(firstFoodcourtId || null);
      } else if (
        selectedFoodcourt &&
        !foodcourtIds.includes(selectedFoodcourt)
      ) {
        // If the currently selected foodcourt is not in the list anymore, select the first one
        setSelectedFoodcourt(firstFoodcourtId || null);
      }
    }
  }, [cart, selectedFoodcourt]);

  // Fetch table information
  useEffect(() => {
    async function fetchTableInfo() {
      try {
        // Only fetch if tableId exists
        if (!tableId) return;

        const response = await fetch(`/api/public/tables/${tableId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch table information");
        }

        const data = await response.json();
        setTableInfo(data);
      } catch (err) {
        console.error("Error fetching table info:", err);
      }
    }

    fetchTableInfo();
  }, [tableId]);

  // Handle storage changes from other tabs/components
  const handleStorageChange = useCallback(() => {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        setCart(JSON.parse(cartData));
      } else {
        // If cart was removed, set empty cart
        setCart({ tableId: tableId, items: [] });
      }
    } catch (err) {
      console.error("Error updating cart from storage event:", err);
    }
  }, [tableId]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        setCart(JSON.parse(cartData));
      } else {
        setCart({ tableId: tableId, items: [] });
      }
    } catch (err) {
      console.error("Error loading cart data:", err);
      setError("Failed to load cart data");
    } finally {
      setLoading(false);
    }

    // Set up event listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [tableId, handleStorageChange]);

  // Update cart quantity
  const updateQuantity = (itemId: string, change: number) => {
    if (!cart) return;

    const updatedItems = cart.items.map((item) => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    const updatedCart = { ...cart, items: updatedItems };

    // Update state first
    setCart(updatedCart);

    // Then update localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Dispatch storage event for other components
    window.dispatchEvent(new Event("storage"));
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    if (!cart) return;

    const updatedItems = cart.items.filter((item) => item.id !== itemId);
    const updatedCart = { ...cart, items: updatedItems };

    // Update state first
    setCart(updatedCart);

    // Then update localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Dispatch storage event for other components
    window.dispatchEvent(new Event("storage"));

    // If cart is empty, redirect back to menu
    if (updatedItems.length === 0) {
      // Slight delay to ensure storage event is processed
      setTimeout(() => {
        router.push(`/table/${tableId}`);
      }, 100);
    }
  };

  // Remove all items from a foodcourt
  const clearFoodcourt = (foodcourtId: string) => {
    if (!cart) return;

    const updatedItems = cart.items.filter(
      (item) => item.foodcourtId !== foodcourtId,
    );
    const updatedCart = { ...cart, items: updatedItems };

    // Update state first
    setCart(updatedCart);

    // Then update localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Dispatch storage event for other components
    window.dispatchEvent(new Event("storage"));

    // If cart is empty, redirect back to menu
    if (updatedItems.length === 0) {
      // Slight delay to ensure storage event is processed
      setTimeout(() => {
        router.push(`/table/${tableId}`);
      }, 100);
    }
  };

  // Submit order for the selected foodcourt only
  const submitOrder = async () => {
    if (!cart || !selectedFoodcourt || !tableInfo) return;

    // Get items from the selected foodcourt only
    const foodcourtItems = cart.items.filter(
      (item) => item.foodcourtId === selectedFoodcourt,
    );

    if (foodcourtItems.length === 0) return;

    // Validate that customer name is provided
    const trimmedCustomerName = customerName.trim();
    if (!trimmedCustomerName) {
      setError("Nama pemesan harus diisi sebelum melakukan pemesanan");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        tableId: tableId,
        customerName: trimmedCustomerName, // Customer name is now required
        items: foodcourtItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || undefined,
        })),
      };

      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit order");
      }

      // Order successful - remove the ordered items from cart
      const remainingItems = cart.items.filter(
        (item) => item.foodcourtId !== selectedFoodcourt,
      );

      if (remainingItems.length > 0) {
        const updatedCart = { ...cart, items: remainingItems };
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      } else {
        localStorage.removeItem("cart");
        setCart({ tableId: tableId, items: [] });
      }

      window.dispatchEvent(new Event("storage"));
      setOrderSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/table/${tableId}/orders`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting order:", err);
      setError(err instanceof Error ? err.message : "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  // Empty cart view
  if (!loading && (!cart || cart.items.length === 0) && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center">
              <Link
                href={`/table/${tableId}`}
                className="mr-3 rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Keranjang Anda
                </h1>
                {tableInfo && (
                  <p className="text-sm text-gray-500">
                    Meja #{tableInfo.tableNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center shadow-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              Keranjang Anda kosong
            </h3>
            <p className="mb-6 text-gray-500">
              Anda belum menambahkan item ke keranjang
            </p>
            <Link
              href={`/table/${tableId}`}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Jelajahi Foodcourt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Order success view
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center">
              <Link
                href={`/table/${tableId}`}
                className="mr-3 rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Konfirmasi Pesanan
                </h1>
                {tableInfo && (
                  <p className="text-sm text-gray-500">
                    Meja #{tableInfo.tableNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center shadow-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              Pesanan Berhasil Dikirim
            </h3>
            <p className="mb-2 text-gray-500">
              {customerName
                ? `Terima kasih, ${customerName}!`
                : "Terima kasih!"}
            </p>
            <p className="mb-6 text-gray-500">
              Pesanan Anda telah dikirim dan sedang dipersiapkan.
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Mengalihkan ke halaman pesanan...
            </p>
            <Link
              href={`/table/${tableId}/orders`}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Lihat Pesanan Anda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get the selected foodcourt items and subtotal
  const selectedFoodcourtData = selectedFoodcourt
    ? groupedItems[selectedFoodcourt]
    : null;

  const foodcourtSubtotal = selectedFoodcourtData?.subtotal ?? 0;
  const foodcourtTax = foodcourtSubtotal * taxRate;
  const foodcourtTotal = foodcourtSubtotal + foodcourtTax;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center">
            <Link
              href={`/table/${tableId}`}
              className="mr-3 rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Keranjang Anda
              </h1>
              {tableInfo && (
                <p className="text-sm text-gray-500">
                  Meja #{tableInfo.tableNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Foodcourt Tabs */}
        {Object.keys(groupedItems).length > 1 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Pilih Foodcourt untuk Memesan:
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(groupedItems).map(
                ([foodcourtId, { foodcourtName, subtotal }]) => (
                  <button
                    key={foodcourtId}
                    onClick={() => setSelectedFoodcourt(foodcourtId)}
                    className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                      selectedFoodcourt === foodcourtId
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    {foodcourtName}
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedFoodcourtData?.foodcourtName || "Cart Items"}
                </h2>
                {selectedFoodcourtData && selectedFoodcourt && (
                  <button
                    onClick={() => clearFoodcourt(selectedFoodcourt)}
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    <span className="text-sm">Hapus Semua</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedFoodcourtData ? (
                <div className="divide-y divide-gray-200">
                  {selectedFoodcourtData.items.map((item) => (
                    <div key={item.id} className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-gray-500">
                            Rp {item.price.toLocaleString("id-ID")} per item
                          </p>
                          {item.specialInstructions && (
                            <p className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">
                                Instruksi khusus:
                              </span>{" "}
                              {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="mb-2 font-bold text-blue-600">
                            Rp{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "id-ID",
                            )}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            <span className="text-sm">Hapus</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="flex items-center rounded-md border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  Silakan pilih foodcourt untuk melihat item
                </p>
              )}

              <div className="mt-6">
                <Link
                  href={`/table/${tableId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <span className="flex items-center">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Lanjutkan Belanja
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Ringkasan Pesanan
              </h2>

              {selectedFoodcourtData ? (
                <>
                  <div className="mb-6">
                    {/* Customer Name Input */}
                    <div className="mb-4">
                      <label
                        htmlFor="customerName"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Nama Pemesan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Masukkan nama Anda"
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Nama pemesan wajib diisi untuk melanjutkan pemesanan
                      </p>
                    </div>

                    <div className="mb-2 flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        Rp {foodcourtSubtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-gray-600">Pajak (10%)</span>
                      <span className="font-medium">
                        Rp {foodcourtTax.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        Rp {foodcourtTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={submitOrder}
                    disabled={submitting}
                    className={`w-full rounded-md py-3 font-medium text-white ${
                      submitting
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="mr-2 h-5 w-5 animate-spin text-white"
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
                        Memproses...
                      </span>
                    ) : (
                      `Pesan dari ${selectedFoodcourtData.foodcourtName}`
                    )}
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-500">
                  Silakan pilih foodcourt untuk memesan
                </p>
              )}

              <div className="mt-4 text-xs text-gray-500">
                <p>
                  Dengan melakukan pemesanan, Anda menyetujui syarat dan
                  ketentuan dari foodcourt.
                </p>
              </div>
            </div>

            {/* Multiple foodcourt info */}
            {Object.keys(groupedItems).length > 1 && (
              <div className="mt-6 rounded-lg bg-yellow-50 p-4 shadow-md">
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0 rounded-full bg-yellow-100 p-1">
                    <svg
                      className="h-5 w-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-yellow-800">
                      Beberapa Foodcourt
                    </h3>
                    <p className="text-xs text-yellow-700">
                      Keranjang Anda berisi item dari beberapa foodcourt. Anda
                      perlu melakukan pemesanan terpisah untuk setiap foodcourt.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

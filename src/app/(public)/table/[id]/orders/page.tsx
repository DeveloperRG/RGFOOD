"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";

// Define types for the API response
interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImage: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstructions: string | null;
  status: string;
  formattedPrice: string;
  formattedSubtotal: string;
}

interface FoodcourtGroup {
  foodcourtId: string;
  foodcourtName: string;
  items: OrderItem[];
  subtotal: number;
  formattedSubtotal: string;
}

interface Order {
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  formattedTotalAmount: string;
  foodcourts: FoodcourtGroup[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OrdersResponse {
  orders: Order[];
  pagination: PaginationInfo;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PREPARING":
      return "bg-blue-100 text-blue-800";
    case "READY":
      return "bg-green-100 text-green-800";
    case "DELIVERED":
      return "bg-purple-100 text-purple-800";
    case "CANCELED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to translate status
const translateStatus = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Menunggu";
    case "PREPARING":
      return "Sedang Diproses";
    case "READY":
      return "Siap Diambil";
    case "DELIVERED":
      return "Terkirim";
    case "CANCELED":
      return "Dibatalkan";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = typeof params?.id === "string" ? params.id : "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<{ tableNumber: string } | null>(null);

  // Fetch table info
  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const response = await fetch(`/api/public/tables/${tableId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch table information");
        }
        const data = await response.json();
        setTableInfo({ tableNumber: data.tableNumber });
      } catch (err) {
        console.error("Error fetching table info:", err);
      }
    };

    if (tableId) {
      fetchTableInfo();
    }
  }, [tableId]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/tables/${tableId}/orders`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch orders");
        }
        
        const data: OrdersResponse = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (tableId) {
      fetchOrders();
    }
  }, [tableId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
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
                <h1 className="text-xl font-bold text-gray-900">Pesanan Anda</h1>
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
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              Belum Ada Pesanan
            </h3>
            <p className="mb-6 text-gray-500">
              Anda belum melakukan pesanan apapun
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

  // Orders list view
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
              <h1 className="text-xl font-bold text-gray-900">Pesanan Anda</h1>
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
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Pesanan #{order.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {translateStatus(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                {order.foodcourts.map((foodcourt) => (
                  <div key={foodcourt.foodcourtId} className="mb-6 last:mb-0">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-900">
                        {foodcourt.foodcourtName}
                      </h4>
                      <span className="text-sm font-medium text-gray-700">
                        Subtotal: {foodcourt.formattedSubtotal}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {foodcourt.items.map((item) => (
                        <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <div className="flex items-start">
                                {item.menuItemImage && (
                                  <div className="mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={item.menuItemImage}
                                      alt={item.menuItemName}
                                      width={64}
                                      height={64}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>
                                )}
                                <div>
                                  <h5 className="text-base font-medium text-gray-900">
                                    {item.menuItemName}
                                  </h5>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.quantity} x {item.formattedPrice}
                                  </p>
                                  {item.specialInstructions && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      <span className="font-medium">Instruksi khusus:</span>{" "}
                                      {item.specialInstructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col items-end">
                              <span className="text-sm font-medium text-gray-900">
                                {item.formattedSubtotal}
                              </span>
                              <span
                                className={`mt-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {translateStatus(item.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-blue-600">
                      {order.formattedTotalAmount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                <Link
                  href={`/table/${tableId}/orders/${order.id}`}
                  className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <span>Lihat Detail Pesanan</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - can be implemented if needed */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`rounded-md px-3 py-1 text-sm ${
                      page === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      // Implement page change logic if needed
                    }}
                  >
                    {page}
                  </button>
                )
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

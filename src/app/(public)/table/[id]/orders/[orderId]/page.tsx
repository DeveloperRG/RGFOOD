"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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

// Helper function to get status icon
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "PENDING":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "PREPARING":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "READY":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "DELIVERED":
      return <CheckCircle className="h-5 w-5 text-purple-500" />;
    case "CANCELED":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = typeof params?.id === "string" ? params.id : "";
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";

  const [order, setOrder] = useState<Order | null>(null);
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

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        // Fetch from the orders list API and find the specific order
        const response = await fetch(`/api/public/tables/${tableId}/orders`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch order details");
        }
        
        const data = await response.json();
        const foundOrder = data.orders.find((o: Order) => o.id === orderId);
        
        if (!foundOrder) {
          throw new Error("Order not found");
        }
        
        setOrder(foundOrder);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err instanceof Error ? err.message : "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (tableId && orderId) {
      fetchOrderDetails();
    }
  }, [tableId, orderId]);

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
            onClick={() => router.back()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center">
              <Link
                href={`/table/${tableId}/orders`}
                className="mr-3 rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Detail Pesanan</h1>
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
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              Pesanan Tidak Ditemukan
            </h3>
            <p className="mb-6 text-gray-500">
              Pesanan yang Anda cari tidak dapat ditemukan
            </p>
            <Link
              href={`/table/${tableId}/orders`}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Kembali ke Daftar Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Order detail view
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center">
            <Link
              href={`/table/${tableId}/orders`}
              className="mr-3 rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Detail Pesanan</h1>
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
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {/* Order Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Pesanan #{order.id.substring(0, 8)}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {translateStatus(order.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="px-6 py-4">
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama Pelanggan</h3>
                <p className="mt-1 text-sm text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Pembayaran</h3>
                <p className="mt-1 text-sm font-bold text-blue-600">
                  {order.formattedTotalAmount}
                </p>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="mb-4 text-base font-medium text-gray-900">Status Pesanan</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {["PENDING", "PREPARING", "READY", "DELIVERED"].map((status, index) => {
                    const isActive = ["PENDING", "PREPARING", "READY", "DELIVERED"].indexOf(order.status) >= index;
                    return (
                      <div key={status} className="relative flex items-start">
                        <div className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${
                          isActive ? "bg-blue-500" : "bg-gray-200"
                        }`}>
                          <StatusIcon status={status} />
                        </div>
                        <div className="ml-12">
                          <h4 className={`text-sm font-medium ${
                            isActive ? "text-gray-900" : "text-gray-500"
                          }`}>
                            {translateStatus(status)}
                          </h4>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {isActive
                              ? status === order.status
                                ? "Status saat ini"
                                : "Selesai"
                              : "Menunggu"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items by Foodcourt */}
            <div className="space-y-8">
              <h3 className="text-base font-medium text-gray-900">Detail Item</h3>
              
              {order.foodcourts.map((foodcourt) => (
                <div key={foodcourt.foodcourtId} className="rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {foodcourt.foodcourtName}
                      </h4>
                      <span className="text-sm font-medium text-gray-700">
                        Subtotal: {foodcourt.formattedSubtotal}
                      </span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {foodcourt.items.map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start">
                          {item.menuItemImage && (
                            <div className="mr-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <Image
                                src={item.menuItemImage}
                                alt={item.menuItemName}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                          )}
                          
                          <div className="flex-grow">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="text-base font-medium text-gray-900">
                                  {item.menuItemName}
                                </h5>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.quantity} x {item.formattedPrice}
                                </p>
                                {item.specialInstructions && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    <span className="font-medium">Instruksi khusus:</span>{" "}
                                    {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end">
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-900">Total Pembayaran</span>
                <span className="text-base font-bold text-blue-600">
                  {order.formattedTotalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              <Link
                href={`/table/${tableId}/orders`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Kembali ke Daftar Pesanan
              </Link>
              <Link
                href={`/table/${tableId}`}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Pesan Lagi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

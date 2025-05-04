"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  Eye,
  History,
  ListFilter,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { OrderStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
  status: OrderStatus;
}

interface Order {
  id: string;
  customerName: string;
  tableNumber: string;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
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
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.PREPARING:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.READY:
      return "bg-green-100 text-green-800";
    case OrderStatus.DELIVERED:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.CANCELED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to translate status
const translateStatus = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Menunggu";
    case OrderStatus.PREPARING:
      return "Sedang Diproses";
    case OrderStatus.READY:
      return "Siap Diambil";
    case OrderStatus.DELIVERED:
      return "Terkirim";
    case OrderStatus.CANCELED:
      return "Dibatalkan";
    default:
      return status;
  }
};

export default function OwnerOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const ownerId = typeof params?.id === "string" ? params.id : "";

  const [foodcourtId, setFoodcourtId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    canceled: 0,
    total: 0,
  });

  // Fetch owner's foodcourt ID
  useEffect(() => {
    const fetchOwnerFoodcourt = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/owner/${ownerId}/foodcourt`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch owner's foodcourt",
          );
        }

        const data = await response.json();

        if (data.foodcourt) {
          setFoodcourtId(data.foodcourt.id);
        } else {
          // Owner doesn't have a foodcourt assigned
          setFoodcourtId(null);
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        console.error("Error fetching owner's foodcourt:", err);
        setError("Tidak dapat menemukan foodcourt untuk pemilik ini");
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchOwnerFoodcourt();
    }
  }, [ownerId]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!foodcourtId) return;

    try {
      setLoading(true);

      let url = `/api/foodcourt/${foodcourtId}/orders?page=${currentPage}`;

      // Apply status filter based on active tab
      if (activeTab === "active") {
        // For active tab, we can filter by specific active statuses
        if (statusFilter !== "ALL") {
          url += `&status=${statusFilter}`;
        } else {
          // If no specific filter, show all active orders (not delivered or canceled)
          url += `&activeOnly=true`;
        }
      } else if (activeTab === "history") {
        // For history tab, we only show delivered and canceled orders
        if (statusFilter !== "ALL") {
          url += `&status=${statusFilter}`;
        } else {
          // If no specific filter, show both delivered and canceled
          url += `&historyOnly=true`;
        }
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);

      // Calculate order stats
      const stats = {
        pending: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        canceled: 0,
        total: data.pagination.total,
      };

      // Count orders by status
      data.orders.forEach((order) => {
        order.items.forEach((item) => {
          switch (item.status) {
            case OrderStatus.PENDING:
              stats.pending++;
              break;
            case OrderStatus.PREPARING:
              stats.preparing++;
              break;
            case OrderStatus.READY:
              stats.ready++;
              break;
            case OrderStatus.DELIVERED:
              stats.delivered++;
              break;
            case OrderStatus.CANCELED:
              stats.canceled++;
              break;
          }
        });
      });

      setOrderStats(stats);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (foodcourtId) {
      fetchOrders();
    }
  }, [foodcourtId, statusFilter, currentPage, activeTab]);

  // Loading state
  if (loading && !isUpdating) {
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
            onClick={() => fetchOrders()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // No foodcourt assigned
  if (!foodcourtId) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">Kelola Pesanan</h1>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-yellow-700">
            Tidak Ada Foodcourt
          </h2>
          <p className="text-yellow-600">
            Anda belum memiliki foodcourt yang ditugaskan. Hubungi administrator
            untuk mendapatkan akses ke foodcourt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
        <button
          onClick={() => fetchOrders()}
          className="flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          disabled={isUpdating}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab("active");
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
            className={cn(
              "border-b-2 py-4 text-sm font-medium",
              activeTab === "active"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            <div className="flex items-center">
              <ListFilter className="mr-2 h-5 w-5" />
              Pesanan Aktif
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
            className={cn(
              "border-b-2 py-4 text-sm font-medium",
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            <div className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Riwayat Pesanan
            </div>
          </button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {activeTab === "active" ? "Total Pesanan Aktif" : "Total Riwayat"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>

        {activeTab === "active" ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                  <div className="text-2xl font-bold">{orderStats.pending}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diproses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-500" />
                  <div className="text-2xl font-bold">
                    {orderStats.preparing}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Siap Diambil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  <div className="text-2xl font-bold">{orderStats.ready}</div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {orderStats.delivered}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Dibatalkan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  <div className="text-2xl font-bold">
                    {orderStats.canceled}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-gray-500" />
          <span className="mr-2 text-sm font-medium text-gray-700">
            Filter:
          </span>
          {activeTab === "active" ? (
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "ALL")
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Semua Pesanan Aktif</option>
              <option value={OrderStatus.PENDING}>Menunggu</option>
              <option value={OrderStatus.PREPARING}>Sedang Diproses</option>
              <option value={OrderStatus.READY}>Siap Diambil</option>
            </select>
          ) : (
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "ALL")
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Semua Riwayat</option>
              <option value={OrderStatus.DELIVERED}>Terkirim</option>
              <option value={OrderStatus.CANCELED}>Dibatalkan</option>
            </select>
          )}
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pesanan..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {activeTab === "active" ? (
                <Clock className="h-8 w-8 text-gray-400" />
              ) : (
                <History className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              {activeTab === "active"
                ? "Belum Ada Pesanan Aktif"
                : "Belum Ada Riwayat Pesanan"}
            </h3>
            <p className="mb-6 text-gray-500">
              {activeTab === "active"
                ? "Belum ada pesanan aktif yang masuk untuk foodcourt ini"
                : "Belum ada pesanan terkirim atau dibatalkan untuk foodcourt ini"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() =>
                router.push(`/owner/${ownerId}/foodcourt/orders/${order.id}`)
              }
            >
              <CardHeader className="border-b bg-gray-50 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Pesanan #{order.id.substring(0, 8)}
                      </h3>
                      <span className="ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Meja #{order.tableNumber}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="mr-1 text-sm font-medium text-gray-700">
                        Pelanggan:
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {order.customerName || "Tanpa Nama"}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-blue-600">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </span>
                    <button
                      className="flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/owner/${ownerId}/foodcourt/orders/${order.id}`,
                        );
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-4">
                <div className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          {item.menuItemImage && (
                            <div className="mr-4 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
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
                            <h4 className="text-base font-medium text-gray-900">
                              {item.menuItemName}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.quantity} x Rp{" "}
                              {item.unitPrice.toLocaleString("id-ID")}
                            </p>
                            {item.specialInstructions && (
                              <p className="mt-1 text-xs text-gray-500">
                                <span className="font-medium">
                                  Instruksi khusus:
                                </span>{" "}
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <span className="text-sm font-medium text-gray-900">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </span>
                          <div className="mt-2 flex items-center">
                            <span
                              className={`mr-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                item.status,
                              )}`}
                            >
                              {translateStatus(item.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
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
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

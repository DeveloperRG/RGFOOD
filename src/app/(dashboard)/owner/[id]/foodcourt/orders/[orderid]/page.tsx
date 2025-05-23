"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Define types for the API response
interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImage: string | null;
  quantity: number;
  unitPrice: number;
  formattedUnitPrice: string;
  subtotal: number;
  formattedSubtotal: string;
  specialInstructions: string | null;
  status: OrderStatus;
}

interface OrderLog {
  id: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  updatedAt: Date;
  updatedBy: {
    id: string;
    name: string | null;
    role: string;
  } | null;
}

interface Order {
  id: string;
  customerName: string;
  tableNumber: string;
  tableId: string;
  totalAmount: number;
  formattedTotalAmount: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  logs: OrderLog[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const ownerId = typeof params?.id === "string" ? params.id : "";
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";

  const [foodcourtId, setFoodcourtId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {},
  );

  // Fetch foodcourt ID
  useEffect(() => {
    const fetchFoodcourtId = async () => {
      try {
        const response = await fetch(`/api/owner/${ownerId}/foodcourt`);
        if (!response.ok) {
          throw new Error("Failed to fetch foodcourt");
        }
        const data = await response.json();
        if (data.foodcourt) {
          setFoodcourtId(data.foodcourt.id);
        }
      } catch (err) {
        console.error("Error fetching foodcourt:", err);
        setError("Failed to load foodcourt information");
      }
    };

    if (ownerId) {
      fetchFoodcourtId();
    }
  }, [ownerId]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!foodcourtId || !orderId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/foodcourt/${foodcourtId}/orders/${orderId}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load order details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [foodcourtId, orderId]);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: OrderStatus) => {
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

  // Get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case OrderStatus.PREPARING:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case OrderStatus.READY:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case OrderStatus.CANCELED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Translate status to Indonesian
  const translateStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Menunggu";
      case OrderStatus.PREPARING:
        return "Diproses";
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

  // Handle status change
  const handleStatusChange = async (itemId: string, newStatus: string) => {
    if (!foodcourtId) return;

    try {
      setUpdatingStatus((prev) => ({ ...prev, [itemId]: true }));

      const response = await fetch(
        `/api/foodcourt/${foodcourtId}/orderitems/${itemId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      // Update the local state
      setOrder((prevOrder) => {
        if (!prevOrder) return null;

        return {
          ...prevOrder,
          items: prevOrder.items.map((item) =>
            item.id === itemId
              ? { ...item, status: newStatus as OrderStatus }
              : item,
          ),
        };
      });

      toast.success("Status pesanan berhasil diperbarui");
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui status pesanan",
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center">
          <Link
            href={`/owner/${ownerId}/foodcourt/orders`}
            className="mr-4 rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span>Memuat detail pesanan...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center">
          <Link
            href={`/owner/${ownerId}/foodcourt/orders`}
            className="mr-4 rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        </div>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // No foodcourt assigned
  if (!foodcourtId) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">Detail Pesanan</h1>
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

  // No order found
  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center">
          <Link
            href={`/owner/${ownerId}/foodcourt/orders`}
            className="mr-4 rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        </div>
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-yellow-700">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-yellow-600">
            Pesanan yang Anda cari tidak ditemukan atau tidak tersedia.
          </p>
        </div>
      </div>
    );
  }

  // Order detail view
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center">
        <Link
          href={`/owner/${ownerId}/foodcourt/orders`}
          className="mr-4 rounded-full p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold">Detail Pesanan</h1>
      </div>

      {/* Customer Information Card */}
      <div className="mt-6">
        <Card>
          <CardHeader className="border-b bg-blue-50 px-6 py-4">
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg font-medium text-gray-900">
                Informasi Pelanggan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Nama Pelanggan
                </h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {order.customerName || "Tanpa Nama"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Nomor Meja
                </h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  #{order.tableNumber}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Waktu Pemesanan
                </h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <Card>
          <CardHeader className="border-b bg-gray-50 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Pesanan #{order.id.substring(0, 8)}
                  </CardTitle>
                  <span className="ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    Total: {order.formattedTotalAmount}
                  </span>
                </div>
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
                        <h3 className="text-base font-medium text-gray-900">
                          {item.menuItemName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.quantity} x {item.formattedUnitPrice}
                        </p>
                        {item.specialInstructions && (
                          <p className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">
                              Instruksi khusus:
                            </span>{" "}
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">
                        {item.formattedSubtotal}
                      </span>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge
                          className={`flex items-center space-x-1 ${getStatusBadge(
                            item.status,
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          <span>{translateStatus(item.status)}</span>
                        </Badge>
                        {item.status !== OrderStatus.DELIVERED &&
                          item.status !== OrderStatus.CANCELED && (
                            <Select
                              value={item.status}
                              onValueChange={(value) =>
                                handleStatusChange(item.id, value)
                              }
                              disabled={updatingStatus[item.id]}
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue placeholder="Ubah Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={OrderStatus.PENDING}>
                                  Menunggu
                                </SelectItem>
                                <SelectItem value={OrderStatus.PREPARING}>
                                  Diproses
                                </SelectItem>
                                <SelectItem value={OrderStatus.READY}>
                                  Siap Diambil
                                </SelectItem>
                                <SelectItem value={OrderStatus.DELIVERED}>
                                  Terkirim
                                </SelectItem>
                                <SelectItem value={OrderStatus.CANCELED}>
                                  Dibatalkan
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order history */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            {order.logs.length > 0 ? (
              <div className="space-y-4">
                {order.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 rounded-md border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="mt-0.5">
                      {log.newStatus === OrderStatus.PENDING && (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      {log.newStatus === OrderStatus.PREPARING && (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                      {log.newStatus === OrderStatus.READY && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {log.newStatus === OrderStatus.DELIVERED && (
                        <CheckCircle className="h-5 w-5 text-purple-500" />
                      )}
                      {log.newStatus === OrderStatus.CANCELED && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        Status diubah menjadi{" "}
                        <span className="font-medium">
                          {translateStatus(log.newStatus)}
                        </span>
                        {log.previousStatus && (
                          <>
                            {" "}
                            dari{" "}
                            <span className="font-medium">
                              {translateStatus(log.previousStatus)}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span>
                          {formatDate(log.updatedAt)}
                          {log.updatedBy && (
                            <>
                              {" "}
                              oleh{" "}
                              <span className="font-medium">
                                {log.updatedBy.name || "Unknown"}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Tidak ada riwayat perubahan status
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

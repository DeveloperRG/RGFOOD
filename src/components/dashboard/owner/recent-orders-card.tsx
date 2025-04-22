// ~/components/dashboard/owner/recent-order-card.tsx

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";

// Updated to match schema
enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: MenuItem;
  status: OrderStatus;
  foodcourtId: string;
}

interface Table {
  id: string;
  tableNumber: string;
}

interface Order {
  id: string;
  createdAt: Date;
  orderItems: OrderItem[];
  table: Table;
  totalAmount: number;
}

interface RecentOrdersCardProps {
  orders: Order[];
}

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  // Function to get badge variant based on status
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "secondary";
      case OrderStatus.PREPARING:
        return "secondary"; // Map to a supported variant
      case OrderStatus.READY:
        return "outline"; // Map to a supported variant
      case OrderStatus.DELIVERED:
        return "default";
      case OrderStatus.CANCELED:
        return "destructive";
      default:
        return "default";
    }
  };

  // Format date to local time
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          Manage and view the latest orders for your foodcourt
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground text-sm">No recent orders</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{order.table?.tableNumber || "N/A"}</TableCell>
                  <TableCell>{order.orderItems.length}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {order.orderItems.length > 0 && (
                      <div className="space-x-1">
                        {Array.from(
                          new Set(order.orderItems.map((item) => item.status)),
                        ).map((status, index) => (
                          <Badge key={index} variant={getStatusBadge(status)}>
                            {status.toLowerCase()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/owner/${order.orderItems[0]?.foodcourtId}/orders/${order.id}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
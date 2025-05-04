// src/app/api/foodcourt/[foodcourtId]/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { OrderStatus, type OrderItem, type OrderLog } from "@prisma/client";

/**
 * GET /api/foodcourt/[foodcourtId]/orders/[orderId]
 * Endpoint for foodcourt owners to get details of a specific order
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { foodcourtId: string; orderId: string } },
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { foodcourtId, orderId } = params;

    // Check if user has permission to view orders for this foodcourt
    const permission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: userId,
          foodcourtId,
        },
      },
    });

    if (!permission?.canViewOrders) {
      return NextResponse.json(
        {
          error: "You don't have permission to view orders for this foodcourt",
        },
        { status: 403 },
      );
    }

    // Get the order with its items
    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        table: true,
        orderItems: {
          where: {
            foodcourtId: foodcourtId,
          },
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Get order logs separately
    const orderLogs = await db.orderLog.findMany({
      where: {
        orderId: orderId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if this order has any items for this foodcourt
    if (!order.orderItems || order.orderItems.length === 0) {
      return NextResponse.json(
        { error: "This order does not contain any items for your foodcourt" },
        { status: 404 },
      );
    }

    // Format the response
    const formattedOrder = {
      id: order.id,
      customerName: order.customerName,
      tableNumber: order.table?.tableNumber || "N/A",
      tableId: order.tableId,
      totalAmount: Number(order.totalAmount),
      formattedTotalAmount: `Rp ${Number(order.totalAmount).toLocaleString("id-ID")}`,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map(
        (
          item: OrderItem & {
            menuItem: { name: string; image: string | null };
          },
        ) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItem.name,
          menuItemImage: item.menuItem.image,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          formattedUnitPrice: `Rp ${Number(item.unitPrice).toLocaleString("id-ID")}`,
          subtotal: Number(item.subtotal),
          formattedSubtotal: `Rp ${Number(item.subtotal).toLocaleString("id-ID")}`,
          specialInstructions: item.specialInstructions,
          status: item.status,
        }),
      ),
      logs: orderLogs.map(
        (
          log: OrderLog & {
            updatedBy?: {
              id: string;
              name: string | null;
              role: string;
            } | null;
          },
        ) => ({
          id: log.id,
          previousStatus: log.previousStatus,
          newStatus: log.newStatus,
          updatedAt: log.updatedAt,
          updatedBy: log.updatedBy
            ? {
                id: log.updatedBy.id,
                name: log.updatedBy.name,
                role: log.updatedBy.role,
              }
            : null,
        }),
      ),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch order details",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

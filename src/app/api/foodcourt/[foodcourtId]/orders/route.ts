// src/app/api/foodcourt/[foodcourtId]/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { OrderStatus } from "@prisma/client";

/**
 * GET /api/foodcourt/[foodcourtId]/orders
 * Endpoint for foodcourt owners to view orders for their foodcourt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { foodcourtId: string } },
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { foodcourtId } = params;

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const activeOnly = searchParams.get("activeOnly") === "true";
    const historyOnly = searchParams.get("historyOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const whereClause: any = {
      foodcourtId,
    };

    // Filter by status if provided
    if (status) {
      whereClause.status = status as OrderStatus;
    }
    // Filter for active orders (not delivered or canceled)
    else if (activeOnly) {
      whereClause.status = {
        notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
      };
    }
    // Filter for history (only delivered and canceled)
    else if (historyOnly) {
      whereClause.status = {
        in: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
      };
    }

    // Get order items for this foodcourt with pagination
    const orderItems = await db.orderItem.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        order: {
          include: {
            table: {
              select: {
                tableNumber: true,
              },
            },
          },
        },
        menuItem: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await db.orderItem.count({
      where: whereClause,
    });

    // Group order items by order
    const ordersMap = new Map();

    orderItems.forEach((item) => {
      const orderId = item.orderId;

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: item.order.id,
          customerName: item.order.customerName,
          tableNumber: item.order.table.tableNumber,
          createdAt: item.order.createdAt,
          items: [],
          totalAmount: 0,
        });
      }

      const order = ordersMap.get(orderId);

      order.items.push({
        id: item.id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItem.name,
        menuItemImage: item.menuItem.image,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        specialInstructions: item.specialInstructions,
        status: item.status,
      });

      order.totalAmount += Number(item.subtotal);
    });

    // Convert map to array
    const orders = Array.from(ordersMap.values());

    return NextResponse.json({
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

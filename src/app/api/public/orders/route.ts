// src/app/api/public/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { OrderStatus } from "@prisma/client";

// Define interfaces for the request data
interface OrderItemRequest {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

interface OrderRequest {
  tableId: string;
  customerName?: string; // Make optional since we can use table number as default
  items: OrderItemRequest[];
  specialInstructions?: string;
}

// Define interface for order item data
interface OrderItemData {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstructions: string;
  status: OrderStatus;
  foodcourtId: string;
}

/**
 * POST /api/public/orders
 * Public API to place an order
 */
export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as OrderRequest;
    const { tableId, customerName, items } = data;

    // Validate input
    if (!tableId || !items || !items.length) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Bidang yang diperlukan tidak lengkap",
        },
        { status: 400 },
      );
    }

    // Validate that table exists
    const table = await db.table.findUnique({
      where: {
        id: tableId,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          error: "Table not found",
          message: "Meja tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // Use table number as customer name if not provided
    const effectiveCustomerName = customerName || `Meja #${table.tableNumber}`;

    // Validate items are available and get their prices and foodcourt IDs
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        isAvailable: true,
      },
      include: {
        foodcourt: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        {
          error: "Some menu items are not available or do not exist",
          message: "Beberapa item menu tidak tersedia atau tidak ada",
        },
        { status: 400 },
      );
    }

    // Create menu item lookup maps
    const menuItemPriceMap = new Map<string, number>();
    const menuItemFoodcourtMap = new Map<string, string>();

    menuItems.forEach((item) => {
      menuItemPriceMap.set(item.id, Number(item.price));
      menuItemFoodcourtMap.set(item.id, item.foodcourtId);
    });

    // Calculate total amount
    let totalAmount = 0;

    // Check if all items are from different foodcourts and prepare order items
    const orderItemsData: OrderItemData[] = items.map((item) => {
      const price = menuItemPriceMap.get(item.menuItemId) || 0;
      const quantity = item.quantity || 1;
      const subtotal = price * quantity;
      totalAmount += subtotal;

      const foodcourtId = menuItemFoodcourtMap.get(item.menuItemId);
      if (!foodcourtId) {
        throw new Error(
          `Foodcourt ID not found for menu item: ${item.menuItemId}`,
        );
      }

      return {
        menuItemId: item.menuItemId,
        quantity,
        unitPrice: price,
        subtotal,
        specialInstructions: item.specialInstructions || "",
        status: OrderStatus.PENDING,
        foodcourtId,
      };
    });

    // Find active table session or create a new one
    let tableSession = await db.tableSession.findFirst({
      where: {
        tableId,
        isActive: true,
      },
    });

    if (!tableSession) {
      tableSession = await db.tableSession.create({
        data: {
          tableId,
          sessionStart: new Date(),
          isActive: true,
        },
      });
    }

    // Create a system user ID or fetch an admin user for required relations
    const systemUser = await db.user.findFirst({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    if (!systemUser) {
      return NextResponse.json(
        {
          error:
            "System configuration error: No admin user found for system operations",
        },
        { status: 500 },
      );
    }

    // Create order with transaction to ensure all order items are created
    const order = await db.$transaction(async (prisma) => {
      // Create the main order
      const newOrder = await prisma.order.create({
        data: {
          customerName: effectiveCustomerName,
          totalAmount,
          status: OrderStatus.PENDING,
          tableId,
          // We'll create order items separately
        },
      });

      // Create order items
      for (const item of orderItemsData) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: item.menuItemId,
            foodcourtId: item.foodcourtId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            specialInstructions: item.specialInstructions,
            status: item.status,
          },
        });
      }

      // Create order log entry
      await prisma.orderLog.create({
        data: {
          orderId: newOrder.id,
          newStatus: OrderStatus.PENDING,
          updatedById: systemUser.id, // Use admin user for system operations
        },
      });

      // Create notifications for each foodcourt owner
      const uniqueFoodcourtIds = [
        ...new Set(orderItemsData.map((item) => item.foodcourtId)),
      ];

      for (const foodcourtId of uniqueFoodcourtIds) {
        await prisma.ownerNotification.create({
          data: {
            foodcourtId,
            orderId: newOrder.id,
            message: `Pesanan baru #${newOrder.id} diterima dari ${effectiveCustomerName}`,
          },
        });
      }

      // Create customer notification
      await prisma.orderNotification.create({
        data: {
          orderId: newOrder.id,
          message: `Pesanan Anda telah diterima dan sedang diproses.`,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil dibuat",
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          formattedAmount: `Rp ${Number(order.totalAmount).toLocaleString("id-ID")}`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to place order:", error);
    return NextResponse.json(
      {
        error: "Failed to place order",
        message: "Gagal membuat pesanan",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// src/app/api/foodcourt/[foodcourtId]/orderitems/[orderItemId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { OrderStatus } from "@prisma/client";

interface UpdateStatusRequest {
  status: OrderStatus;
}

/**
 * PATCH /api/foodcourt/[foodcourtId]/orderitems/[orderItemId]/status
 * Endpoint for foodcourt owners to update the status of an order item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { foodcourtId: string; orderItemId: string } }
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { foodcourtId, orderItemId } = params;

    // Check if user has permission to update orders for this foodcourt
    const permission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: userId,
          foodcourtId,
        },
      },
    });

    if (!permission?.canUpdateOrders) {
      return NextResponse.json(
        { error: "You don't have permission to update orders for this foodcourt" },
        { status: 403 }
      );
    }

    // Get the request body
    const data = (await request.json()) as UpdateStatusRequest;
    const { status } = data;

    // Validate status
    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if the order item exists and belongs to this foodcourt
    const orderItem = await db.orderItem.findFirst({
      where: {
        id: orderItemId,
        foodcourtId,
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found or does not belong to this foodcourt" },
        { status: 404 }
      );
    }

    // Don't allow updating if already in final state
    if (
      orderItem.status === OrderStatus.DELIVERED ||
      orderItem.status === OrderStatus.CANCELED
    ) {
      return NextResponse.json(
        { error: `Cannot update order item that is already ${orderItem.status}` },
        { status: 400 }
      );
    }

    // Update the order item status in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Update the order item status
      const updatedOrderItem = await prisma.orderItem.update({
        where: {
          id: orderItemId,
        },
        data: {
          status,
        },
      });

      // Create a log entry for this status change
      await prisma.orderLog.create({
        data: {
          orderId: orderItem.orderId,
          orderItemId: orderItemId,
          previousStatus: orderItem.status,
          newStatus: status,
          updatedById: userId,
        },
      });

      // Create a notification for the customer
      await prisma.orderNotification.create({
        data: {
          orderId: orderItem.orderId,
          message: `Your order item status has been updated to ${status}`,
          isDisplayed: false,
        },
      });

      return updatedOrderItem;
    });

    // Check if all order items have the same status, and if so, update the main order status
    const allOrderItems = await db.orderItem.findMany({
      where: {
        orderId: orderItem.orderId,
      },
    });

    const allSameStatus = allOrderItems.every(item => item.status === status);
    
    if (allSameStatus) {
      // Update the main order status
      await db.order.update({
        where: {
          id: orderItem.orderId,
        },
        data: {
          status,
        },
      });

      // Create a log entry for the main order status change
      await db.orderLog.create({
        data: {
          orderId: orderItem.orderId,
          previousStatus: orderItem.order.status,
          newStatus: status,
          updatedById: userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderItem: {
        id: result.id,
        status: result.status,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      {
        error: "Failed to update order status",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

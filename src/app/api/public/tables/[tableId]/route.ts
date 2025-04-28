// app/api/public/tables/[tableId]/route.ts
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    tableId: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { tableId } = params;

    if (!tableId) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 },
      );
    }

    // Get table details
    const table = await db.table.findUnique({
      where: {
        id: tableId,
      },
      select: {
        id: true,
        tableNumber: true,
        capacity: true,
        qrCode: true,
        isAvailable: true,
        // Get the active session if any
        tableSessions: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            sessionStart: true,
          },
          take: 1,
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Check if table has an active order
    const activeOrders = await db.order.findMany({
      where: {
        tableId: tableId,
        status: {
          in: ["PENDING", "PREPARING", "READY"],
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    // Format the response
    const response = {
      ...table,
      activeSession: table.tableSessions[0] || null,
      activeOrders: activeOrders.length > 0 ? activeOrders : null,
      hasActiveOrder: activeOrders.length > 0,
    };

    // Remove the tableSessions array from the response
    delete (response as any).tableSessions;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[TABLE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
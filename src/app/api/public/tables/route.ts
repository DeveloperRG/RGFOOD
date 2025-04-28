// app/api/public/tables/route.ts

import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination if needed
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Parse limit, default to 100 if not specified or invalid
    let limit: number | undefined;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    // Get tables with their active sessions (if any)
    const tables = await db.table.findMany({
      where: {
        // You can add filters here if needed, e.g., isActive: true
      },
      select: {
        id: true,
        tableNumber: true,
        capacity: true,
        qrCode: true,
        isAvailable: true,
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
      skip: offset,
      ...(limit ? { take: limit } : {}),
      orderBy: {
        tableNumber: "asc", // Sort by table number
      },
    });

    // Get the total count for pagination
    const totalCount = await db.table.count();

    // For each table, check if it has active orders
    const tablesWithOrderInfo = await Promise.all(
      tables.map(async (table) => {
        // Check if table has an active order
        const activeOrders = await db.order.findMany({
          where: {
            tableId: table.id,
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

        // Transform the table data to the expected format
        return {
          ...table,
          activeSession: table.tableSessions[0] || null,
          hasActiveOrder: activeOrders.length > 0,
          activeOrders: activeOrders.length > 0 ? activeOrders : null,
        };
      }),
    );

    // Remove the tableSessions array from the response objects
    const formattedTables = tablesWithOrderInfo.map((table) => {
      const { tableSessions, ...rest } = table;
      return rest;
    });

    // Return the tables with pagination info
    return NextResponse.json(
      {
        tables: formattedTables,
        pagination: {
          total: totalCount,
          offset,
          limit: limit || formattedTables.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[TABLES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
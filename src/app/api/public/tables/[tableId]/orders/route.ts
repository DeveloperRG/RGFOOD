// src/app/api/public/tables/[tableId]/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

/**
 * GET /api/public/tables/[tableId]/orders
 * Public API for customers to view their orders for a specific table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;

    // Validate table exists
    const table = await db.table.findUnique({
      where: {
        id: tableId,
      },
    });

    if (!table) {
      return NextResponse.json(
        { 
          error: "Table not found",
          message: "Meja tidak ditemukan" 
        }, 
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const whereClause: any = {
      tableId,
    };

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Get orders for this table with pagination
    const orders = await db.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                image: true,
              },
            },
            foodcourt: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await db.order.count({
      where: whereClause,
    });

    // Format the response
    const formattedOrders = orders.map(order => {
      // Group order items by foodcourt
      const foodcourtGroups = new Map();
      
      order.orderItems.forEach(item => {
        const foodcourtId = item.foodcourtId;
        
        if (!foodcourtGroups.has(foodcourtId)) {
          foodcourtGroups.set(foodcourtId, {
            foodcourtId,
            foodcourtName: item.foodcourt.name,
            items: [],
            subtotal: 0,
          });
        }
        
        const group = foodcourtGroups.get(foodcourtId);
        
        group.items.push({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItem.name,
          menuItemImage: item.menuItem.image,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          specialInstructions: item.specialInstructions,
          status: item.status,
          formattedPrice: `Rp ${Number(item.unitPrice).toLocaleString('id-ID')}`,
          formattedSubtotal: `Rp ${Number(item.subtotal).toLocaleString('id-ID')}`,
        });
        
        group.subtotal += Number(item.subtotal);
      });
      
      // Convert map to array and add formatted subtotals
      const foodcourts = Array.from(foodcourtGroups.values()).map(group => ({
        ...group,
        formattedSubtotal: `Rp ${group.subtotal.toLocaleString('id-ID')}`,
      }));
      
      return {
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalAmount: Number(order.totalAmount),
        formattedTotalAmount: `Rp ${Number(order.totalAmount).toLocaleString('id-ID')}`,
        foodcourts,
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
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
        message: "Gagal mengambil pesanan",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

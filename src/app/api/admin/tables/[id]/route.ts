import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { generateTableQrCodeUrl } from "~/lib/qrcode-utils";

// Schema untuk validasi input update meja
const updateTableSchema = z.object({
  tableNumber: z.string().min(1, "Nomor meja harus diisi").optional(),
  capacity: z.number().min(1, "Kapasitas minimal 1 orang").optional(),
  isAvailable: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/tables/[id]
 * Detail meja spesifik
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Ambil detail meja
    const table = await db.table.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        tableNumber: true,
        capacity: true,
        qrCode: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
        // Ambil sesi aktif jika ada
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
        // Ambil order aktif jika ada
        orders: {
          where: {
            status: {
              in: ["PENDING", "PREPARING", "READY"],
            },
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
            customerName: true,
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Format respons
    const { tableSessions, ...rest } = table;
    const response = {
      ...rest,
      activeSession: tableSessions[0] || null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_TABLE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tables/[id]
 * Update informasi meja
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Periksa apakah meja ada
    const existingTable = await db.table.findUnique({
      where: {
        id,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Parse dan validasi input
    const data = await req.json();
    const validationResult = updateTableSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { tableNumber, capacity, isAvailable } = validationResult.data;

    // Jika nomor meja diubah, periksa apakah sudah ada
    if (tableNumber && tableNumber !== existingTable.tableNumber) {
      const tableWithSameNumber = await db.table.findUnique({
        where: {
          tableNumber,
        },
      });

      if (tableWithSameNumber) {
        return NextResponse.json(
          { error: "Table number already exists" },
          { status: 400 }
        );
      }
    }

    // Update meja
    const updatedTable = await db.table.update({
      where: {
        id,
      },
      data: {
        ...(tableNumber && { tableNumber }),
        ...(capacity !== undefined && { capacity }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return NextResponse.json(updatedTable, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_TABLE_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tables/[id]
 * Hapus meja dengan validasi
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Periksa apakah meja ada
    const existingTable = await db.table.findUnique({
      where: {
        id,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ["PENDING", "PREPARING", "READY"],
            },
          },
        },
        tableSessions: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Periksa apakah meja memiliki order aktif
    if (existingTable.orders.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete table with active orders",
          activeOrders: existingTable.orders.length
        },
        { status: 400 }
      );
    }

    // Periksa apakah meja memiliki sesi aktif
    if (existingTable.tableSessions.length > 0) {
      // Tutup sesi aktif
      await db.tableSession.updateMany({
        where: {
          tableId: id,
          isActive: true,
        },
        data: {
          isActive: false,
          sessionEnd: new Date(),
        },
      });
    }

    // Hapus meja
    await db.table.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Table deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_TABLE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

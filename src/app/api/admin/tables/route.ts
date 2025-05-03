import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { generateTableQrCodeUrl } from "~/lib/qrcode-utils";

// Schema untuk validasi input pembuatan meja
const createTableSchema = z.object({
  tableNumber: z.string().min(1, "Nomor meja harus diisi"),
  capacity: z.number().min(1, "Kapasitas minimal 1 orang"),
  isAvailable: z.boolean().default(true),
});

/**
 * GET /api/admin/tables
 * Mendapatkan daftar meja dengan filter
 */
export async function GET(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Ambil parameter query untuk filter dan pagination
    const { searchParams } = new URL(req.url);
    const isAvailable = searchParams.get("isAvailable");
    const tableNumber = searchParams.get("tableNumber");
    const limitParam = searchParams.get("limit");
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Parse limit, default ke 100 jika tidak ditentukan atau tidak valid
    let limit: number | undefined;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    // Buat filter berdasarkan parameter
    const filter: any = {};
    
    if (isAvailable !== null) {
      filter.isAvailable = isAvailable === "true";
    }
    
    if (tableNumber) {
      filter.tableNumber = {
        contains: tableNumber,
        mode: "insensitive",
      };
    }

    // Ambil data meja dengan filter
    const tables = await db.table.findMany({
      where: filter,
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
      },
      skip: offset,
      ...(limit ? { take: limit } : {}),
      orderBy: {
        tableNumber: "asc",
      },
    });

    // Hitung total untuk pagination
    const totalCount = await db.table.count({
      where: filter,
    });

    // Format respons
    const formattedTables = tables.map((table) => {
      const { tableSessions, ...rest } = table;
      return {
        ...rest,
        activeSession: tableSessions[0] || null,
      };
    });

    // Kembalikan data meja dengan info pagination
    return NextResponse.json(
      {
        tables: formattedTables,
        pagination: {
          total: totalCount,
          offset,
          limit: limit || formattedTables.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_TABLES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tables
 * Membuat meja baru dengan QR code
 */
export async function POST(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse dan validasi input
    const data = await req.json();
    const validationResult = createTableSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { tableNumber, capacity, isAvailable } = validationResult.data;

    // Periksa apakah nomor meja sudah ada
    const existingTable = await db.table.findUnique({
      where: {
        tableNumber,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      );
    }

    // Buat meja baru
    const newTable = await db.table.create({
      data: {
        tableNumber,
        capacity,
        isAvailable,
        // Generate QR code URL (placeholder, akan diupdate setelah meja dibuat)
        qrCode: "placeholder",
      },
    });

    // Generate QR code URL dengan ID meja yang baru dibuat
    const qrCodeUrl = generateTableQrCodeUrl(newTable.id);

    // Update meja dengan QR code URL
    const updatedTable = await db.table.update({
      where: {
        id: newTable.id,
      },
      data: {
        qrCode: qrCodeUrl,
      },
    });

    // Kembalikan data meja yang baru dibuat
    return NextResponse.json(updatedTable, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_TABLES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

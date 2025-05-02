// ~/src/app/api/admin/owners/[id]/permissions/history/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mendapatkan history perubahan permission untuk owner tertentu
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const ownerId = params.id;

    // Validasi owner exists
    const owner = await db.user.findUnique({
      where: { id: ownerId, role: UserRole.OWNER },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }

    // Ambil query parameters
    const searchParams = req.nextUrl.searchParams;
    const foodcourtId = searchParams.get("foodcourtId");
    const changedById = searchParams.get("changedById");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Buat filter object untuk Prisma
    const filter: any = {
      permission: {
        ownerId,
      },
    };

    // Filter untuk foodcourt tertentu
    if (foodcourtId) {
      filter.permission.foodcourtId = foodcourtId;
    }

    // Filter untuk user yang melakukan perubahan
    if (changedById) {
      filter.changedById = changedById;
    }

    // Filter berdasarkan tanggal
    if (startDate || endDate) {
      filter.changedAt = {};

      if (startDate) {
        filter.changedAt.gte = new Date(startDate);
      }

      if (endDate) {
        // Set endDate to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.changedAt.lte = endDateTime;
      }
    }

    // Ambil data history dengan filter
    const [history, total] = await Promise.all([
      db.permissionHistory.findMany({
        where: filter,
        include: {
          permission: {
            include: {
              foodcourt: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          changedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { changedAt: "desc" },
      }),
      db.permissionHistory.count({ where: filter }),
    ]);

    return NextResponse.json({
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      },
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting owner permission history:", error);
    return NextResponse.json(
      { error: "Failed to get owner permission history" },
      { status: 500 }
    );
  }
}
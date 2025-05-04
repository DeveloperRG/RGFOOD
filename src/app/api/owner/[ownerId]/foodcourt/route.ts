// src/app/api/owner/[ownerId]/foodcourt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

/**
 * GET /api/owner/[ownerId]/foodcourt
 * Endpoint for owners to get their assigned foodcourt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ownerId: string } },
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Tidak diizinkan" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { ownerId } = params;

    // Only allow users to access their own data unless they're an admin
    if (userId !== ownerId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden", message: "Anda tidak memiliki akses" },
        { status: 403 },
      );
    }

    // Get the owner's foodcourt
    const owner = await db.user.findUnique({
      where: {
        id: ownerId,
      },
      include: {
        ownedFoodcourt: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            isActive: true,
          },
        },
      },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found", message: "Pemilik tidak ditemukan" },
        { status: 404 },
      );
    }

    // Get the foodcourt (an owner has only one foodcourt based on the schema)
    const foodcourt = owner.ownedFoodcourt;

    return NextResponse.json({
      foodcourt,
    });
  } catch (error) {
    console.error("Failed to fetch owner's foodcourt:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch owner's foodcourt",
        message: "Gagal mengambil data foodcourt",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

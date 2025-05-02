import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mendapatkan data owner berdasarkan ID
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

    // Ambil data owner beserta foodcourt yang dimilikinya
    const owner = await db.user.findUnique({
      where: { 
        id: ownerId,
        role: UserRole.OWNER 
      },
      include: {
        ownedFoodcourt: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error("Error getting owner data:", error);
    return NextResponse.json(
      { error: "Failed to get owner data" },
      { status: 500 }
    );
  }
}
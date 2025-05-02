import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mendapatkan daftar owner beserta foodcourt yang dimilikinya
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

    // Ambil semua user dengan role OWNER beserta foodcourt yang dimilikinya
    const owners = await db.user.findMany({
      where: { 
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
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: owners });
  } catch (error) {
    console.error("Error getting owners data:", error);
    return NextResponse.json(
      { error: "Failed to get owners data" },
      { status: 500 }
    );
  }
}
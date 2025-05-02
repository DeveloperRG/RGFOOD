// ~/src/app/api/admin/foodcourts/[id]/owner-permissions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mendapatkan permission untuk foodcourt tertentu
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

    const foodcourtId = params.id;

    // Validasi foodcourt exists
    const foodcourt = await db.foodcourt.findUnique({
      where: { id: foodcourtId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 }
      );
    }

    // Jika foodcourt tidak memiliki owner
    if (!foodcourt.owner) {
      return NextResponse.json({
        foodcourt: {
          id: foodcourt.id,
          name: foodcourt.name,
        },
        owner: null,
        permissions: null,
      });
    }

    // Ambil permission untuk foodcourt ini
    const permission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: foodcourt.owner.id,
          foodcourtId,
        },
      },
    });

    return NextResponse.json({
      foodcourt: {
        id: foodcourt.id,
        name: foodcourt.name,
      },
      owner: foodcourt.owner,
      permissions: permission,
    });
  } catch (error) {
    console.error("Error getting foodcourt owner permissions:", error);
    return NextResponse.json(
      { error: "Failed to get foodcourt owner permissions" },
      { status: 500 }
    );
  }
}
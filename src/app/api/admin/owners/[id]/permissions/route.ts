import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Schema untuk validasi input update permission
const updatePermissionSchema = z.object({
  canEditMenu: z.boolean(),
  canViewOrders: z.boolean(),
  canUpdateOrders: z.boolean(),
});

// Handler untuk mendapatkan permission owner
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

    // Ambil semua permission untuk owner ini
    const permissions = await db.ownerPermission.findMany({
      where: { ownerId },
      include: {
        foodcourt: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error getting owner permissions:", error);
    return NextResponse.json(
      { error: "Failed to get owner permissions" },
      { status: 500 }
    );
  }
}

// Handler untuk mengupdate permission owner
export async function PUT(
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
    const data = await req.json();

    // Validasi input
    const validatedData = updatePermissionSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

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

    // Validasi owner has a foodcourt
    const foodcourt = await db.foodcourt.findUnique({
      where: { ownerId },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Owner does not have a foodcourt assigned" },
        { status: 400 }
      );
    }

    // Cek apakah permission sudah ada
    const existingPermission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId,
          foodcourtId: foodcourt.id,
        },
      },
    });

    let permission;

    if (existingPermission) {
      // Simpan state sebelumnya untuk history
      const previousSettings = {
        canEditMenu: existingPermission.canEditMenu,
        canViewOrders: existingPermission.canViewOrders,
        canUpdateOrders: existingPermission.canUpdateOrders,
      };

      // Update permission yang sudah ada
      permission = await db.ownerPermission.update({
        where: { id: existingPermission.id },
        data: validatedData.data,
      });

      // Catat history perubahan
      await db.permissionHistory.create({
        data: {
          permissionId: permission.id,
          previousSettings,
          newSettings: validatedData.data,
          changedById: session.user.id,
        },
      });
    } else {
      // Buat permission baru jika belum ada
      permission = await db.ownerPermission.create({
        data: {
          ...validatedData.data,
          ownerId,
          foodcourtId: foodcourt.id,
        },
      });

      // Catat history perubahan (initial creation)
      await db.permissionHistory.create({
        data: {
          permissionId: permission.id,
          previousSettings: {
            canEditMenu: true, // default values
            canViewOrders: true,
            canUpdateOrders: true,
          },
          newSettings: validatedData.data,
          changedById: session.user.id,
        },
      });
    }

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error updating owner permissions:", error);
    return NextResponse.json(
      { error: "Failed to update owner permissions" },
      { status: 500 }
    );
  }
}
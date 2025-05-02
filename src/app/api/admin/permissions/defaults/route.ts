// ~/src/app/api/admin/permissions/defaults/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Schema untuk validasi input update default permission
const updateDefaultPermissionSchema = z.object({
  canEditMenu: z.boolean(),
  canViewOrders: z.boolean(),
  canUpdateOrders: z.boolean(),
});

// Handler untuk mendapatkan konfigurasi default permission
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

    // Ambil default permission
    // Jika tidak ada, buat default permission dengan nilai default
    let defaultPermission = await db.defaultPermission.findFirst();

    if (!defaultPermission) {
      defaultPermission = await db.defaultPermission.create({
        data: {
          canEditMenu: true,
          canViewOrders: true,
          canUpdateOrders: true,
          updatedById: session.user.id,
        },
      });
    }

    return NextResponse.json(defaultPermission);
  } catch (error) {
    console.error("Error getting default permissions:", error);
    return NextResponse.json(
      { error: "Failed to get default permissions" },
      { status: 500 }
    );
  }
}

// Handler untuk mengupdate konfigurasi default permission
export async function PUT(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validasi input
    const validatedData = updateDefaultPermissionSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // Cek apakah default permission sudah ada
    let defaultPermission = await db.defaultPermission.findFirst();

    if (defaultPermission) {
      // Update default permission yang sudah ada
      defaultPermission = await db.defaultPermission.update({
        where: { id: defaultPermission.id },
        data: {
          ...validatedData.data,
          updatedById: session.user.id,
        },
      });
    } else {
      // Buat default permission baru jika belum ada
      defaultPermission = await db.defaultPermission.create({
        data: {
          ...validatedData.data,
          updatedById: session.user.id,
        },
      });
    }

    return NextResponse.json(defaultPermission);
  } catch (error) {
    console.error("Error updating default permissions:", error);
    return NextResponse.json(
      { error: "Failed to update default permissions" },
      { status: 500 }
    );
  }
}
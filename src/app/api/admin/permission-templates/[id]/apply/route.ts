// ~/src/app/api/admin/permission-templates/[id]/apply/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Schema untuk validasi input apply template
const applyTemplateSchema = z.object({
  ownerIds: z.array(z.string()).min(1, "Minimal satu owner harus dipilih"),
});

// Handler untuk menerapkan template ke satu atau banyak owner
export async function POST(
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

    const templateId = params.id;
    const data = await req.json();

    // Validasi input
    const validatedData = applyTemplateSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // Cek apakah template ada
    const template = await db.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const { ownerIds } = validatedData.data;

    // Validasi semua owner ada dan memiliki role OWNER
    const owners = await db.user.findMany({
      where: {
        id: { in: ownerIds },
        role: UserRole.OWNER,
      },
      include: {
        ownedFoodcourt: true,
      },
    });

    if (owners.length !== ownerIds.length) {
      return NextResponse.json(
        { error: "One or more owners not found or not have OWNER role" },
        { status: 400 }
      );
    }

    // Filter owner yang memiliki foodcourt
    const ownersWithFoodcourt = owners.filter(owner => owner.ownedFoodcourt);
    
    if (ownersWithFoodcourt.length === 0) {
      return NextResponse.json(
        { error: "None of the selected owners have a foodcourt assigned" },
        { status: 400 }
      );
    }

    // Terapkan template ke setiap owner
    const results = await Promise.all(
      ownersWithFoodcourt.map(async (owner) => {
        const foodcourt = owner.ownedFoodcourt;
        
        if (!foodcourt) {
          return {
            ownerId: owner.id,
            success: false,
            message: "Owner does not have a foodcourt assigned",
          };
        }

        // Cek apakah permission sudah ada
        const existingPermission = await db.ownerPermission.findUnique({
          where: {
            ownerId_foodcourtId: {
              ownerId: owner.id,
              foodcourtId: foodcourt.id,
            },
          },
        });

        // Data permission dari template
        const permissionData = {
          canEditMenu: template.canEditMenu,
          canViewOrders: template.canViewOrders,
          canUpdateOrders: template.canUpdateOrders,
        };

        if (existingPermission) {
          // Simpan state sebelumnya untuk history
          const previousSettings = {
            canEditMenu: existingPermission.canEditMenu,
            canViewOrders: existingPermission.canViewOrders,
            canUpdateOrders: existingPermission.canUpdateOrders,
          };

          // Update permission yang sudah ada
          const updatedPermission = await db.ownerPermission.update({
            where: { id: existingPermission.id },
            data: permissionData,
          });

          // Catat history perubahan
          await db.permissionHistory.create({
            data: {
              permissionId: updatedPermission.id,
              previousSettings,
              newSettings: permissionData,
              changedById: session.user.id,
            },
          });

          return {
            ownerId: owner.id,
            ownerName: owner.name,
            foodcourtId: foodcourt.id,
            foodcourtName: foodcourt.name,
            success: true,
            message: "Template applied successfully (updated existing permissions)",
          };
        } else {
          // Buat permission baru jika belum ada
          const newPermission = await db.ownerPermission.create({
            data: {
              ...permissionData,
              ownerId: owner.id,
              foodcourtId: foodcourt.id,
            },
          });

          // Catat history perubahan (initial creation)
          await db.permissionHistory.create({
            data: {
              permissionId: newPermission.id,
              previousSettings: {
                canEditMenu: true, // default values
                canViewOrders: true,
                canUpdateOrders: true,
              },
              newSettings: permissionData,
              changedById: session.user.id,
            },
          });

          return {
            ownerId: owner.id,
            ownerName: owner.name,
            foodcourtId: foodcourt.id,
            foodcourtName: foodcourt.name,
            success: true,
            message: "Template applied successfully (created new permissions)",
          };
        }
      })
    );

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
      },
      results,
      summary: {
        total: ownersWithFoodcourt.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error("Error applying permission template:", error);
    return NextResponse.json(
      { error: "Failed to apply permission template" },
      { status: 500 }
    );
  }
}
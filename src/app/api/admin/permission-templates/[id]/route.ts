// ~/src/app/api/admin/permission-templates/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Schema untuk validasi input update template
const updateTemplateSchema = z.object({
  name: z.string().min(1, "Nama template harus diisi"),
  description: z.string().optional(),
  canEditMenu: z.boolean(),
  canViewOrders: z.boolean(),
  canUpdateOrders: z.boolean(),
});

// Handler untuk mendapatkan detail template
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

    const templateId = params.id;

    // Ambil detail template
    const template = await db.permissionTemplate.findUnique({
      where: { id: templateId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error getting permission template:", error);
    return NextResponse.json(
      { error: "Failed to get permission template" },
      { status: 500 }
    );
  }
}

// Handler untuk mengupdate template
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

    const templateId = params.id;
    const data = await req.json();

    // Validasi input
    const validatedData = updateTemplateSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // Cek apakah template ada
    const existingTemplate = await db.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Cek apakah nama sudah digunakan oleh template lain
    if (validatedData.data.name !== existingTemplate.name) {
      const nameExists = await db.permissionTemplate.findUnique({
        where: { name: validatedData.data.name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Template with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update template
    const updatedTemplate = await db.permissionTemplate.update({
      where: { id: templateId },
      data: validatedData.data,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating permission template:", error);
    return NextResponse.json(
      { error: "Failed to update permission template" },
      { status: 500 }
    );
  }
}

// Handler untuk menghapus template
export async function DELETE(
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

    // Cek apakah template ada
    const existingTemplate = await db.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Hapus template
    await db.permissionTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json(
      { message: "Template deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting permission template:", error);
    return NextResponse.json(
      { error: "Failed to delete permission template" },
      { status: 500 }
    );
  }
}
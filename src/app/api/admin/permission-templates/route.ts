// ~/src/app/api/admin/permission-templates/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Schema untuk validasi input pembuatan template
const createTemplateSchema = z.object({
  name: z.string().min(1, "Nama template harus diisi"),
  description: z.string().optional(),
  canEditMenu: z.boolean().default(true),
  canViewOrders: z.boolean().default(true),
  canUpdateOrders: z.boolean().default(true),
});

// Handler untuk mendapatkan semua template
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

    // Ambil query parameters
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Buat filter object untuk Prisma
    const filter: any = {};

    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }

    // Ambil data template dengan filter
    const [templates, total] = await Promise.all([
      db.permissionTemplate.findMany({
        where: filter,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.permissionTemplate.count({ where: filter }),
    ]);

    return NextResponse.json({
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting permission templates:", error);
    return NextResponse.json(
      { error: "Failed to get permission templates" },
      { status: 500 }
    );
  }
}

// Handler untuk membuat template baru
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

    // Parse request body
    const data = await req.json();

    // Validate the template data
    const validatedData = createTemplateSchema.safeParse(data);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // Check if template name already exists
    const existingTemplate = await db.permissionTemplate.findUnique({
      where: { name: validatedData.data.name },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 400 }
      );
    }

    // Create new template
    const template = await db.permissionTemplate.create({
      data: {
        ...validatedData.data,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating permission template:", error);
    return NextResponse.json(
      { error: "Failed to create permission template" },
      { status: 500 }
    );
  }
}
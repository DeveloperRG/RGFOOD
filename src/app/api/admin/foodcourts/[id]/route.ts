// ~/app/api/foodcourts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema validasi untuk update foodcourt
const updateFoodcourtSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/foodcourts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const foodcourt = await db.foodcourt.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        ownerPermissions: true,
        menuCategories: {
          select: { id: true, name: true, displayOrder: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!foodcourt) {
      return NextResponse.json({ error: "Foodcourt not found" }, { status: 404 });
    }

    return NextResponse.json(foodcourt, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch foodcourt details:", error);
    return NextResponse.json({ error: "Failed to fetch foodcourt details" }, { status: 500 });
  }
}

// PUT /api/admin/foodcourts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateFoodcourtSchema.parse(body);

    const foodcourt = await db.foodcourt.findUnique({ where: { id: params.id } });
    if (!foodcourt) {
      return NextResponse.json({ error: "Foodcourt not found" }, { status: 404 });
    }

    const updatedFoodcourt = await db.foodcourt.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedFoodcourt, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to update foodcourt:", error);
    return NextResponse.json({ error: "Failed to update foodcourt" }, { status: 500 });
  }
}

// DELETE /api/admin/foodcourts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const foodcourt = await db.foodcourt.findUnique({ where: { id: params.id } });
    if (!foodcourt) {
      return NextResponse.json({ error: "Foodcourt not found" }, { status: 404 });
    }

    await db.foodcourt.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Foodcourt deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete foodcourt:", error);
    return NextResponse.json({ error: "Failed to delete foodcourt" }, { status: 500 });
  }
}

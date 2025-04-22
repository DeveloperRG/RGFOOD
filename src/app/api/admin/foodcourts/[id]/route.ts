// ~/app/api/foodcourts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/admin/foodcourts/[id] - Get foodcourt details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const foodcourt = await db.foodcourt.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true },
        },
        menuCategories: {
          select: { id: true, name: true, displayOrder: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(foodcourt, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch foodcourt details:", error);
    return NextResponse.json(
      { error: "Failed to fetch foodcourt details" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/foodcourts/[id] - Update foodcourt (admin and owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, address, logo, isActive } = await request.json();

    const updatedFoodcourt = await db.foodcourt.update({
      where: { id: params.id },
      data: { name, description, address, logo, isActive },
    });

    return NextResponse.json(updatedFoodcourt, { status: 200 });
  } catch (error) {
    console.error("Failed to update foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to update foodcourt" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/foodcourts/[id] - Delete foodcourt (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.foodcourt.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "Foodcourt deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to delete foodcourt" },
      { status: 500 },
    );
  }
}

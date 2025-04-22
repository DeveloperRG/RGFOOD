import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/foodcourt/[id]/menu/[menuId] - Get menu item details
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const menuItem = await db.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
        foodcourt: { select: { id: true, name: true } },
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(menuItem, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item" },
      { status: 500 },
    );
  }
}

// PUT /api/foodcourt/[id]/menu/[menuId] - Update menu item (Owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingItem = await db.menuItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Check permission
    const userPermission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: session.user.id,
          foodcourtId: existingItem.foodcourtId,
        },
      },
    });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!userPermission && user?.role !== "FOODCOURT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, imageUrl, isAvailable, categoryId } =
      body;

    const updatedItem = await db.menuItem.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: typeof price === "string" ? parseFloat(price) : price,
        imageUrl,
        isAvailable,
        categoryId: categoryId ?? null,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 },
    );
  }
}

// DELETE /api/menu-items/[id] - Delete menu item (Owner only)
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingItem = await db.menuItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    const userPermission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: session.user.id,
          foodcourtId: existingItem.foodcourtId,
        },
      },
    });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!userPermission && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.menuItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "Menu item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 },
    );
  }
}

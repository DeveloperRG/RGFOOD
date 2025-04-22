import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// PATCH /api/foodcourt/[id]/menu/[menuId]/availability - Toggle availability (Owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menuItemId = params.id;
    const { isAvailable } = await request.json();

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "Invalid or missing 'isAvailable' value" },
        { status: 400 },
      );
    }

    const menuItem = await db.menuItem.findUnique({
      where: { id: menuItemId },
      select: { foodcourtId: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Check if user is the owner of the foodcourt or an admin
    const userPermission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: session.user.id,
          foodcourtId: menuItem.foodcourtId,
        },
      },
    });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!userPermission && user?.role !== "FOODCOURT_OWNER") {
      return NextResponse.json(
        { error: "You don't have permission to update this item" },
        { status: 403 },
      );
    }

    const updatedItem = await db.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update menu item availability:", error);
    return NextResponse.json(
      { error: "Failed to update menu item availability" },
      { status: 500 },
    );
  }
}

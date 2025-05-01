import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// PATCH /api/foodcourt/[foodcourtId]/menu/[menuId]/availability - Toggle menu item availability
export async function PATCH(
  request: NextRequest,
  { params }: { params: { foodcourtId: string; menuId: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { foodcourtId, menuId } = params;

    if (!foodcourtId || !menuId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Try to get foodcourt - could be either a foodcourt ID or owner ID
    let foodcourt = await db.foodcourt.findUnique({
      where: { id: foodcourtId },
    });

    // If not found, try to find by owner ID (since there's a 1:1 relationship)
    if (!foodcourt) {
      foodcourt = await db.foodcourt.findUnique({
        where: { ownerId: foodcourtId },
      });
    }

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Get the menu item and verify it belongs to the specified foodcourt
    const menuItem = await db.menuItem.findFirst({
      where: {
        id: menuId,
        foodcourtId: foodcourt.id,
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Check if user has permission to edit menu
    const [userPermission, user] = await Promise.all([
      db.ownerPermission.findUnique({
        where: {
          ownerId_foodcourtId: {
            ownerId: session.user.id,
            foodcourtId: foodcourt.id,
          },
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      }),
    ]);

    const isAdmin = user?.role === "ADMIN";
    const isFoodcourtOwner = user?.role === "OWNER";
    const hasPermission =
      !!userPermission?.canEditMenu || foodcourt.ownerId === session.user.id;

    if (
      !hasPermission &&
      !isAdmin &&
      (!isFoodcourtOwner || foodcourt.ownerId !== session.user.id)
    ) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to modify menu items for this foodcourt",
        },
        { status: 403 },
      );
    }

    // Parse the request body for new availability status
    const data = await request.json();
    const { isAvailable } = data;

    if (isAvailable === undefined || isAvailable === null) {
      return NextResponse.json(
        { error: "isAvailable field is required" },
        { status: 400 },
      );
    }

    // Update the menu item availability
    const updatedMenuItem = await db.menuItem.update({
      where: { id: menuId },
      data: {
        isAvailable: Boolean(isAvailable),
      },
    });

    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update menu item availability:", error);
    return NextResponse.json(
      {
        error: "Failed to update menu item availability",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

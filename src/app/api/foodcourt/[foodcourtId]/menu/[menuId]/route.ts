import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/foodcourt/[foodcourtId]/menu/[menuId] - Get menu item detail
export async function GET(
  request: NextRequest,
  { params }: { params: { foodcourtId: string; menuId: string } },
) {
  try {
    const session = await auth();

    if (!params.foodcourtId || !params.menuId || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let foodcourt = null;

    // Try getting foodcourt from path param (could be foodcourt ID)
    foodcourt = await db.foodcourt.findUnique({
      where: { id: params.foodcourtId },
    });

    // If not found, check if the param is an owner ID
    if (!foodcourt) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: params.foodcourtId },
      });
    }

    // If still not found but we have a session user, try getting their foodcourt
    if (!foodcourt && session?.user?.id) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: session.user.id },
      });
    }

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    const menuItem = await db.menuItem.findFirst({
      where: {
        id: params.menuId,
        foodcourtId: foodcourt.id,
      },
      include: { category: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ menuItem }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// PATCH /api/foodcourt/[id]/menu/[menuId] - Update a menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; menuId: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, price, imageUrl, isAvailable, categoryId } = data;

    // Get foodcourt either from param or by owner ID
    let foodcourt = null;
    if (params.id) {
      foodcourt = await db.foodcourt.findUnique({
        where: { id: params.id },
      });
    }

    // If not found or not passed in params, try getting foodcourt from ownerId (one-to-one)
    if (!foodcourt) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: session.user.id },
      });
    }

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Check permission
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
    const isFoodcourtOwner = user?.role === "FOODCOURT_OWNER";
    const hasPermission =
      !!userPermission || foodcourt.ownerId === session.user.id;

    if (
      !hasPermission &&
      !isAdmin &&
      (!isFoodcourtOwner || foodcourt.ownerId !== session.user.id)
    ) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to update menu items for this foodcourt",
        },
        { status: 403 },
      );
    }

    // Handle price conversion if it's a string
    let priceValue: number | undefined = undefined;
    if (price !== undefined) {
      priceValue = typeof price === "string" ? parseFloat(price) : price;
      if (priceValue !== undefined && isNaN(priceValue)) {
        return NextResponse.json(
          { error: "Invalid price format" },
          { status: 400 },
        );
      }
    }

    // Update menu item
    const updatedItem = await db.menuItem.update({
      where: {
        id: params.menuId,
        foodcourtId: foodcourt.id,
      },
      data: {
        name,
        description,
        price: priceValue,
        imageUrl,
        isAvailable,
        categoryId,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      {
        error: "Failed to update menu item",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
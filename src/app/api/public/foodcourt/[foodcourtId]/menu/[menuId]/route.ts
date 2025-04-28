// app/api/public/foodcourt/[foodcourtId]/menu/[menuId]/route.ts
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    foodcourtId: string;
    menuId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { foodcourtId, menuId } = params;

    if (!foodcourtId || !menuId) {
      return NextResponse.json(
        { error: "Foodcourt ID and Menu Item ID are required" },
        { status: 400 },
      );
    }

    // First check if foodcourt exists and is active
    const foodcourt = await db.foodcourt.findUnique({
      where: {
        id: foodcourtId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Get specific menu item
    const menuItem = await db.menuItem.findUnique({
      where: {
        id: menuId,
        foodcourtId: foodcourtId,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        isAvailable: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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
    console.error("[FOODCOURT_MENU_ITEM_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
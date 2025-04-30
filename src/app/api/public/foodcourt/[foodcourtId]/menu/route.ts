// app/api/public/foodcourt/[foodcourtId]/menu/route.ts
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    foodcourtId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { foodcourtId } = params;
    const { searchParams } = new URL(request.url);
    // Using category type instead of categoryId since there's no categoryId in MenuItem
    const category = searchParams.get("category");

    if (!foodcourtId) {
      return NextResponse.json(
        { error: "Foodcourt ID is required" },
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

    // Get menu items for this foodcourt
    // Note: since there's no direct categoryId in MenuItem, we can't filter by it
    // If you want to filter by category, you'll need to add this field to the schema
    const menuItems = await db.menuItem.findMany({
      where: {
        foodcourtId: foodcourtId,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error("[FOODCOURT_MENU_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

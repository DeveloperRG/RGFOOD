// app/api/public/foodcourt/[foodcourtId]/menu/categories/[categoryId]/route.ts
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
    categoryId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, categoryId } = params;

    if (!id || !categoryId) {
      return NextResponse.json(
        { error: "Foodcourt ID and Category ID are required" },
        { status: 400 },
      );
    }

    // First check if foodcourt exists and is active
    const foodcourt = await db.foodcourt.findUnique({
      where: {
        id,
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

    // Check if category exists
    const category = await db.menuCategory.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        displayOrder: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Get menu items for this category at this foodcourt
    const menuItems = await db.menuItem.findMany({
      where: {
        foodcourtId: id,
        categoryId: categoryId,
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

    // Combine category and items
    const response = {
      ...category,
      items: menuItems,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[FOODCOURT_MENU_CATEGORY_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

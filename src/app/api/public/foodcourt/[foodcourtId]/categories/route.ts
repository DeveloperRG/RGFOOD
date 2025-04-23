// app/api/public/foodcourt/[id]/menu/categories/route.ts
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Foodcourt ID is required" },
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

    // Find all menu categories that have at least one available menu item in this foodcourt
    const menuCategories = await db.menuCategory.findMany({
      where: {
        menuItems: {
          some: {
            foodcourtId: id,
            isAvailable: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        displayOrder: true,
        _count: {
          select: {
            menuItems: {
              where: {
                foodcourtId: id,
                isAvailable: true,
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    // Transform the result to include item count
    const formattedCategories = menuCategories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      displayOrder: category.displayOrder,
      itemCount: category._count.menuItems,
    }));

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error) {
    console.error("[FOODCOURT_MENU_CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    // Optional category filter
    const categoryFilter = searchParams.get("category");

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
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Check if foodcourt is open
    if (foodcourt.status === "TUTUP") {
      return NextResponse.json(
        {
          error: "Foodcourt is currently closed",
          foodcourt: {
            id: foodcourt.id,
            name: foodcourt.name,
            status: foodcourt.status,
          },
        },
        { status: 400 },
      );
    }

    // Build the query based on optional filters
    const whereCondition = {
      foodcourtId: foodcourtId,
      isAvailable: true,
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    };

    const menuItems = await db.menuItem.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        imagePublicId: true,
        isAvailable: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        foodcourt: {
          id: foodcourt.id,
          name: foodcourt.name,
          status: foodcourt.status,
        },
        menuItems: menuItems,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[FOODCOURT_MENU_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

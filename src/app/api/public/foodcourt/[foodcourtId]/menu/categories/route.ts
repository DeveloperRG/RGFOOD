// app/api/public/foodcourt/[foodcourtId]/categories/route.ts
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

    // First check if foodcourt exists
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

    // Get categories for this foodcourt
    const categories = await db.foodcourtCategory.findMany({
      where: {
        foodcourtId: id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        displayOrder: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("[FOODCOURT_CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

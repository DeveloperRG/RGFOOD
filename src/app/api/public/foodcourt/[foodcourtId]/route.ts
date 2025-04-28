// app/api/public/foodcourt/[foodcourtId]/route.ts
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

    if (!foodcourtId) {
      return NextResponse.json(
        { error: "Foodcourt ID is required" },
        { status: 400 },
      );
    }

    const foodcourt = await db.foodcourt.findUnique({
      where: {
        id: foodcourtId,
        isActive: true, // Only return active foodcourts
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        logo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(foodcourt, { status: 200 });
  } catch (error) {
    console.error("[FOODCOURT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
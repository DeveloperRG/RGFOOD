import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const foodcourts = await db.foodcourt.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        image: true,
        imagePublicId: true,
        category: true,
        status: true,
      },
    });

    return NextResponse.json(foodcourts, { status: 200 });
  } catch (error) {
    console.error("[FOODCOURTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

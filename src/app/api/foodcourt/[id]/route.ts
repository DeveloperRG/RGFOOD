// /api/foodcourt/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/foodcourt/[id] - Get foodcourt owned by owner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      session.user.id !== params.id ||
      session.user.role !== "FOODCOURT_OWNER"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const foodcourt = await db.foodcourt.findFirst({
      where: { ownerId: params.id },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(foodcourt, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch foodcourt for owner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/foodcourt/[id] - Update foodcourt (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      session.user.id !== params.id ||
      session.user.role !== "FOODCOURT_OWNER"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, address, logo, isActive } = await request.json();

    const updated = await db.foodcourt.updateMany({
      where: { ownerId: params.id },
      data: { name, description, address, logo, isActive },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "No foodcourt updated" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update owner's foodcourt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

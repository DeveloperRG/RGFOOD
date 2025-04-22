// ~/app/api/foodcourts/route.ts (for GET list & POST create)
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/admin/foodcourt - List all foodcourts
// uncomment baris kalau mau filter foodcourt berdasarkan status aktif atau mau buat filter lain boleh jugak ;)

export async function GET(request: NextRequest) {
  try {
    // const { searchParams } = new URL(request.url);
    // const activeParam = searchParams.get("active");

    // const where: any = {};
    // if (activeParam !== null) {
    //   where.isActive = activeParam === "true";
    // }

    const foodcourts = await db.foodcourt.findMany({
      // where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ foodcourts }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch foodcourts:", error);
    return NextResponse.json(
      { error: "Failed to fetch foodcourts" },
      { status: 500 },
    );
  }
}

// POST /api/admin/foodcourt - Create new foodcourt (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, address, logo, ownerId } = await request.json();

    if (!name || !address || !logo || !ownerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newFoodcourt = await db.foodcourt.create({
      data: {
        name,
        description,
        address,
        logo,
        ownerId,
        isActive: true,
      },
    });

    return NextResponse.json(newFoodcourt, { status: 201 });
  } catch (error) {
    console.error("Failed to create foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to create foodcourt" },
      { status: 500 },
    );
  }
}

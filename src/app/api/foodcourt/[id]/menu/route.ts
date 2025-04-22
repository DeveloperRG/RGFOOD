import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/foodcourt/[id]/menu - List menu items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const foodcourtId = params.id;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const available = searchParams.get("available");

    // Build the where clause based on params and query parameters
    const where: any = {
      foodcourtId: foodcourtId, // Use the path parameter
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (available !== null) {
      where.isAvailable = available === "true";
    }

    const menuItems = await db.menuItem.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ menuItems }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch menu items",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// POST /api/foodcourt/[id]/menu - Create a new menu item (Owner only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    const foodcourtId = params.id;

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, price, imageUrl, isAvailable, categoryId } =
      data;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Convert price to the correct format
    let priceValue: number;
    if (typeof price === "string") {
      priceValue = parseFloat(price);
      if (isNaN(priceValue)) {
        return NextResponse.json(
          { error: "Invalid price format" },
          { status: 400 },
        );
      }
    } else {
      priceValue = price;
    }

    // Check user permissions - both direct owner and role check
    const [userPermission, user, foodcourt] = await Promise.all([
      db.ownerPermission.findUnique({
        where: {
          ownerId_foodcourtId: {
            ownerId: session.user.id,
            foodcourtId: foodcourtId,
          },
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      }),
      db.foodcourt.findUnique({
        where: { id: foodcourtId },
      }),
    ]);

    // Verify foodcourt exists
    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Check if user is foodcourt owner or admin
    const isAdmin = user?.role === "ADMIN";
    const isFoodcourtOwner = user?.role === "FOODCOURT_OWNER";
    const hasPermission =
      !!userPermission || foodcourt.ownerId === session.user.id;

    if (
      !hasPermission &&
      !isAdmin &&
      (!isFoodcourtOwner || foodcourt.ownerId !== session.user.id)
    ) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to add menu items to this foodcourt",
        },
        { status: 403 },
      );
    }

    // Create new menu item
    const menuItem = await db.menuItem.create({
      data: {
        name,
        description,
        price: priceValue,
        imageUrl,
        isAvailable: isAvailable ?? true,
        foodcourtId,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      {
        error: "Failed to create menu item",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

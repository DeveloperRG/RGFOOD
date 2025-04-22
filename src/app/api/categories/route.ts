import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For admin users, return all categories
    // For regular users, only return globally accessible categories
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Get all categories ordered by displayOrder
    const categories = await db.menuCategory.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is allowed to create categories (admin or foodcourt owner)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "FOODCOURT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const data = await request.json();
    const { name, description, displayOrder } = data;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    // Get the highest display order to place new category at the end if not specified
    let newDisplayOrder = displayOrder;
    if (newDisplayOrder === undefined) {
      const highestCategory = await db.menuCategory.findFirst({
        orderBy: { displayOrder: "desc" },
      });
      newDisplayOrder = highestCategory ? highestCategory.displayOrder + 1 : 0;
    }

    // Create new category
    const category = await db.menuCategory.create({
      data: {
        name,
        description,
        displayOrder: newDisplayOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      {
        error: "Failed to create category",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

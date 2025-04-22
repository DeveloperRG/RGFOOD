import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// PATCH /api/categories/reorder - Reorder categories
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - only admin or foodcourt owners can reorder
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "FOODCOURT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const data = await request.json();
    const { categoryIds } = data;

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "Invalid categoryIds format" },
        { status: 400 },
      );
    }

    // Verify all categories exist
    const categories = await db.menuCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "Some categories do not exist" },
        { status: 400 },
      );
    }

    // Update display order for each category
    const updatePromises = categoryIds.map((categoryId, index) =>
      db.menuCategory.update({
        where: { id: categoryId },
        data: { displayOrder: index },
      }),
    );

    await Promise.all(updatePromises);

    // Get updated categories
    const updatedCategories = await db.menuCategory.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(
      { categories: updatedCategories },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return NextResponse.json(
      {
        error: "Failed to reorder categories",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

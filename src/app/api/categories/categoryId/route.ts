import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/categories/[categoryId] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get category by ID
    const category = await db.menuCategory.findUnique({
      where: { id: params.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch category",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// PATCH /api/categories/[categoryId] - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoryId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - only admin or foodcourt owners can update
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "FOODCOURT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if category exists
    const categoryExists = await db.menuCategory.findUnique({
      where: { id: params.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Parse request body
    const data = await request.json();
    const { name, description, displayOrder } = data;

    // Update category
    const updatedCategory = await db.menuCategory.update({
      where: { id: params.categoryId },
      data: {
        name,
        description,
        displayOrder,
      },
    });

    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      {
        error: "Failed to update category",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[categoryId] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - only admin can delete categories
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "FOODCOURT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if category exists
    const category = await db.menuCategory.findUnique({
      where: { id: params.categoryId },
      include: { menuItems: { select: { id: true } } },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Check if category has menu items
    if (category.menuItems.length > 0) {
      // Remove the category from all menu items (set to null) instead of preventing deletion
      await db.menuItem.updateMany({
        where: { categoryId: params.categoryId },
        data: { categoryId: null },
      });
    }

    // Delete category
    await db.menuCategory.delete({
      where: { id: params.categoryId },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      {
        error: "Failed to delete category",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

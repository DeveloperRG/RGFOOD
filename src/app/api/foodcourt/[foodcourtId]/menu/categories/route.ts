// app/api/foodcourt/[id]/menu/categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    const categories = await db.menuCategory.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const categoryNames = categories.map((c) => c.name);
    return NextResponse.json(categoryNames);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

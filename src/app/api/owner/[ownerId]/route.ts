import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

// GET /api/owner/[id] - Get owner profile and their foodcourt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow access to the owner themselves or an admin
    const isAuthorized =
      session.user.id === params.id || session.user.role === "ADMIN";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        ownedFoodcourt: true, // One-to-one relationship (singular)
        createdFoodcourts: true, // One-to-many relationship
        permissions: {
          // Include permissions for foodcourts they have access to
          include: {
            foodcourt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive information
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Failed to fetch owner data:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

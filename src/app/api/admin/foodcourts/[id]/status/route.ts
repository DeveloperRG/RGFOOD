import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // Auth check
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = params;

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Toggle status
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: {
                isActive: !foodcourt.isActive,
            },
        });

        return NextResponse.json({
            id: updatedFoodcourt.id,
            isActive: updatedFoodcourt.isActive,
        });
    } catch (error) {
        console.error("Error toggling foodcourt status:", error);
        return NextResponse.json(
            { error: "Failed to toggle foodcourt status" },
            { status: 500 }
        );
    }
}
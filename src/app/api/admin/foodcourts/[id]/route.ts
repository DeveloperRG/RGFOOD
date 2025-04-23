import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema validasi untuk update foodcourt
const updateFoodcourtSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    description: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters").optional(),
    logo: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
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

        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                creator: {  // Add creator to include
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                ownerPermissions: true,
            },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(foodcourt);
    } catch (error) {
        console.error("Error fetching foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to fetch foodcourt" },
            { status: 500 }
        );
    }
}

export async function PUT(
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
        const body = await req.json();

        // Validate input
        const validatedData = updateFoodcourtSchema.parse(body);

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Update foodcourt
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json(updatedFoodcourt);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to update foodcourt" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Delete foodcourt
        await db.foodcourt.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to delete foodcourt" },
            { status: 500 }
        );
    }
}
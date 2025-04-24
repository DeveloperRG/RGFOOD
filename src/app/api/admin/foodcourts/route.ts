import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { z } from "zod";
import { auth } from "~/server/auth";

// Schema validasi untuk update foodcourts
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
    const session = await auth()
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
                ownerPermissions: true,
                menuCategories: {
                    include: {
                        menuItems: true,
                    },
                },
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
        console.error("Error fetching foodcourts:", error);
        return NextResponse.json(
            { error: "Failed to fetch foodcourts" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // Auth check
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = params;
        const body = await req.json();

        // Validate input
        const validatedData = updateFoodcourtSchema.parse(body);

        // Check if foodcourts exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Update foodcourts
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

        console.error("Error updating foodcourts:", error);
        return NextResponse.json(
            { error: "Failed to update foodcourts" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // Auth check
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = params;

        // Check if foodcourts exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Delete foodcourts (Note: This could cause cascading deletes depending on your DB configuration)
        await db.foodcourt.delete({
            where: { id },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting foodcourts:", error);
        return NextResponse.json(
            { error: "Failed to delete foodcourts" },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema validasi untuk update permissions
const updatePermissionsSchema = z.object({
    foodcourtId: z.string(),
    permissions: z.object({
        canEditMenu: z.boolean(),
        canViewOrders: z.boolean(),
        canUpdateOrders: z.boolean(),
    }),
});

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
        const { id: ownerId } = params;
        const body = await req.json();

        // Validate input
        const { foodcourtId, permissions } = updatePermissionsSchema.parse(body);

        // Verify owner exists and has correct role
        const owner = await db.user.findUnique({
            where: {
                id: ownerId,
                role: "FOODCOURT_OWNER",
            },
        });

        if (!owner) {
            return NextResponse.json(
                { error: "Owner not found or not a foodcourt owner" },
                { status: 404 }
            );
        }

        // Verify foodcourt belongs to owner
        const foodcourt = await db.foodcourt.findUnique({
            where: {
                id: foodcourtId,
                ownerId,
            },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found or not owned by this user" },
                { status: 404 }
            );
        }

        // Update permissions
        const ownerPermission = await db.ownerPermission.upsert({
            where: {
                ownerId_foodcourtId: {
                    ownerId,
                    foodcourtId,
                },
            },
            update: permissions,
            create: {
                ownerId,
                foodcourtId,
                ...permissions,
            },
        });

        return NextResponse.json({
            success: true,
            data: ownerPermission,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating permissions:", error);
        return NextResponse.json(
            { error: "Failed to update permissions" },
            { status: 500 }
        );
    }
}
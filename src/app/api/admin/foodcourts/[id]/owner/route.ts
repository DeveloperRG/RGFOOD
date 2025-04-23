import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema validasi untuk assign owner
const assignOwnerSchema = z.object({
    ownerId: z.string().nullable(),
    permissions: z.object({
        canEditMenu: z.boolean().default(true),
        canViewOrders: z.boolean().default(true),
        canUpdateOrders: z.boolean().default(true),
    }).optional(),
});

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
        const { id: foodcourtId } = params;
        const body = await req.json();

        // Validate input
        const { ownerId, permissions } = assignOwnerSchema.parse(body);

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Check if owner exists if ownerId is provided
        if (ownerId) {
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
        }

        // Use transaction for consistency
        const result = await db.$transaction(async (tx) => {
            // Update foodcourt with new owner (or null to unassign)
            const updatedFoodcourt = await tx.foodcourt.update({
                where: { id: foodcourtId },
                data: {
                    ownerId,
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

            // Create or update permissions if owner is assigned
            let ownerPermission = null;
            if (ownerId && permissions) {
                ownerPermission = await tx.ownerPermission.upsert({
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
            } else if (!ownerId) {
                // If unassigning owner, delete any existing permissions
                await tx.ownerPermission.deleteMany({
                    where: {
                        foodcourtId,
                    },
                });
            }

            return { foodcourt: updatedFoodcourt, permissions: ownerPermission };
        });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error assigning owner:", error);
        return NextResponse.json(
            { error: "Failed to assign owner" },
            { status: 500 }
        );
    }
}
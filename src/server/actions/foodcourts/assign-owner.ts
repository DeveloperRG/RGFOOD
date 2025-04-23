"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

// Validation schema
const assignOwnerSchema = z.object({
    foodcourtId: z.string(),
    ownerId: z.string().nullable(),
    permissions: z.object({
        canEditMenu: z.boolean().default(true),
        canViewOrders: z.boolean().default(true),
        canUpdateOrders: z.boolean().default(true),
    }).optional(),
});

export type AssignOwnerInput = z.infer<typeof assignOwnerSchema>;

export async function assignOwner(data: AssignOwnerInput) {
    try {
        // Auth check
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized: Only admins can assign owners",
            };
        }

        // Validate input
        const validatedData = assignOwnerSchema.parse(data);
        const { foodcourtId, ownerId, permissions } = validatedData;

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
        });

        if (!foodcourt) {
            return {
                success: false,
                error: "Foodcourt not found",
            };
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
                return {
                    success: false,
                    error: "Owner not found or not a foodcourt owner",
                };
            }
        }

        // Use transaction for consistency
        const result = await db.$transaction(async (tx) => {
            // Update foodcourt owner
            const updatedFoodcourt = await tx.foodcourt.update({
                where: { id: foodcourtId },
                data: {
                    ownerId, // Can be null to unassign
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Handle permissions
            let ownerPermission = null;

            if (ownerId && permissions) {
                // Create or update permissions if assigning owner
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
                // Delete permissions if unassigning owner
                await tx.ownerPermission.deleteMany({
                    where: {
                        foodcourtId,
                    },
                });
            }

            return { foodcourt: updatedFoodcourt, permissions: ownerPermission };
        });

        // Clear cache
        revalidatePath(`/admin/foodcourts/${foodcourtId}`);
        revalidatePath("/admin/foodcourts");
        if (ownerId) {
            revalidatePath(`/admin/owners/${ownerId}`);
        }

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Error assigning owner:", error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: "Failed to assign owner",
        };
    }
}
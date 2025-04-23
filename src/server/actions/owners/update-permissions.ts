"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

// Validation schema
const updatePermissionsSchema = z.object({
    ownerId: z.string(),
    foodcourtId: z.string(),
    permissions: z.object({
        canEditMenu: z.boolean(),
        canViewOrders: z.boolean(),
        canUpdateOrders: z.boolean(),
    }),
});

export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;

export async function updateOwnerPermissions(data: UpdatePermissionsInput) {
    try {
        // Auth check
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized: Only admins can update permissions",
            };
        }

        // Validate input
        const validatedData = updatePermissionsSchema.parse(data);
        const { ownerId, foodcourtId, permissions } = validatedData;

        // Verify owner exists and has correct role
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

        // Verify foodcourt belongs to owner
        const foodcourt = await db.foodcourt.findUnique({
            where: {
                id: foodcourtId,
                ownerId,
            },
        });

        if (!foodcourt) {
            return {
                success: false,
                error: "Foodcourt not found or not owned by this user",
            };
        }

        // Update permissions
        const updatedPermissions = await db.ownerPermission.upsert({
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

        // Revalidate paths
        revalidatePath(`/admin/owners/${ownerId}`);
        revalidatePath(`/admin/owners/${ownerId}/permissions`);
        revalidatePath(`/admin/foodcourts/${foodcourtId}`);

        return {
            success: true,
            data: updatedPermissions,
        };
    } catch (error) {
        console.error("Error updating permissions:", error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: "Failed to update permissions",
        };
    }
}
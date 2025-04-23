"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

// Validation schema
const createFoodcourtSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters"),
    logo: z.string().optional(),
    isActive: z.boolean().default(true),
    ownerId: z.string().optional().nullable(),
    permissions: z.object({
        canEditMenu: z.boolean().default(true),
        canViewOrders: z.boolean().default(true),
        canUpdateOrders: z.boolean().default(true),
    }).optional(),
});

export type CreateFoodcourtInput = z.infer<typeof createFoodcourtSchema>;

export async function createFoodcourt(formData: CreateFoodcourtInput) {
    try {
        // Auth check
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized: Only admins can create foodcourts",
            };
        }

        // Validate input
        const validatedData = createFoodcourtSchema.parse(formData);
        const { ownerId, permissions, ...foodcourtData } = validatedData;

        // Use transaction for consistency
        const result = await db.$transaction(async (tx) => {
            // Create foodcourt with admin as creator and optional owner
            const foodcourt = await tx.foodcourt.create({
                data: {
                    ...foodcourtData,
                    creator: {
                        connect: { id: session.user.id } // Admin as creator
                    },
                    ...(ownerId ? { owner: { connect: { id: ownerId } } } : {}), // Optional owner
                },
            });

            // Create permissions if owner is assigned
            if (ownerId && permissions) {
                await tx.ownerPermission.create({
                    data: {
                        ownerId,
                        foodcourtId: foodcourt.id,
                        ...permissions,
                    },
                });
            }

            return foodcourt;
        });

        // Clear cache
        revalidatePath("/admin/foodcourts");

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Error creating foodcourt:", error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: "Failed to create foodcourt",
        };
    }
}
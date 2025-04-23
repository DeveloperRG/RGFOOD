"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

// Validation schema
const updateFoodcourtSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    description: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters").optional(),
    logo: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type UpdateFoodcourtInput = z.infer<typeof updateFoodcourtSchema>;

export async function updateFoodcourt(formData: UpdateFoodcourtInput) {
    try {
        // Auth check
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized: Only admins can update foodcourts",
            };
        }

        // Validate input
        const validatedData = updateFoodcourtSchema.parse(formData);
        const { id, ...updateData } = validatedData;

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
        });

        if (!foodcourt) {
            return {
                success: false,
                error: "Foodcourt not found",
            };
        }

        // Update foodcourt
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: updateData,
        });

        // Clear cache
        revalidatePath(`/admin/foodcourts/${id}`);
        revalidatePath("/admin/foodcourts");

        return {
            success: true,
            data: updatedFoodcourt,
        };
    } catch (error) {
        console.error("Error updating foodcourt:", error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: "Failed to update foodcourt",
        };
    }
}
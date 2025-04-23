"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

// Validation schema
const deleteFoodcourtSchema = z.object({
    id: z.string(),
});

export type DeleteFoodcourtInput = z.infer<typeof deleteFoodcourtSchema>;

export async function deleteFoodcourt(formData: DeleteFoodcourtInput) {
    try {
        // Auth check
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized: Only admins can delete foodcourts",
            };
        }

        // Validate input
        const { id } = deleteFoodcourtSchema.parse(formData);

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

        // Delete foodcourt (cascading deletes will handle related records)
        await db.foodcourt.delete({
            where: { id },
        });

        // Clear cache
        revalidatePath("/admin/foodcourts");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting foodcourt:", error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: "Failed to delete foodcourt",
        };
    }
}
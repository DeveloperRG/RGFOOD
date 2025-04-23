"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

// Validation schema
const toggleStatusSchema = z.object({
    id: z.string(),
});

export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;

export async function toggleFoodcourtStatus(formData: ToggleStatusInput) {
    try {
        // Auth check
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized: Only admins can toggle foodcourt status",
            };
        }

        // Validate input
        const { id } = toggleStatusSchema.parse(formData);

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (!foodcourt) {
            return {
                success: false,
                error: "Foodcourt not found",
            };
        }

        // Toggle status
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: {
                isActive: !foodcourt.isActive,
            },
        });

        // Clear cache
        revalidatePath(`/admin/foodcourts/${id}`);
        revalidatePath("/admin/foodcourts");

        return {
            success: true,
            data: {
                id: updatedFoodcourt.id,
                isActive: updatedFoodcourt.isActive,
            },
        };
    } catch (error) {
        console.error("Error toggling foodcourt status:", error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: "Failed to toggle foodcourt status",
        };
    }
}
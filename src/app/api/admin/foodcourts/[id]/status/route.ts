import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole} from "@prisma/client";

// Schema untuk validasi input status
const statusSchema = z.object({
    isActive: z.boolean(),
});

// Handler untuk mengubah status foodcourt (active/inactive)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Periksa autentikasi
        const session = await auth();
        if (!session || session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        const id = params.id;

        // Periksa apakah foodcourt ada
        const existingFoodcourt = await db.foodcourt.findUnique({
            where: { id },
        });

        if (!existingFoodcourt) {
            return NextResponse.json(
                { error: 'Foodcourt not found' },
                { status: 404 }
            );
        }

        // Parse dan validasi body request
        const body = await req.json();
        const validatedData = statusSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        // Update status foodcourt
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: {
                isActive: validatedData.data.isActive,
            },
        });

        return NextResponse.json(updatedFoodcourt);
    } catch (error) {
        console.error('Error updating foodcourt status:', error);
        return NextResponse.json(
            { error: 'Failed to update foodcourt status' },
            { status: 500 }
        );
    }
}
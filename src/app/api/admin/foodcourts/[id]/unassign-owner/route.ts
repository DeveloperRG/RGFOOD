import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mencabut assignment owner dari foodcourt
export async function PUT(
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

        const foodcourtId = params.id;

        // Periksa apakah foodcourt ada
        const existingFoodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
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

        if (!existingFoodcourt) {
            return NextResponse.json(
                { error: 'Foodcourt not found' },
                { status: 404 }
            );
        }

        // Periksa apakah foodcourt memiliki owner
        if (!existingFoodcourt.ownerId) {
            return NextResponse.json(
                { error: 'Foodcourt does not have an owner assigned' },
                { status: 400 }
            );
        }

        // Hapus owner permissions
        await db.ownerPermission.deleteMany({
            where: { foodcourtId },
        });

        // Update foodcourt untuk menghapus owner
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id: foodcourtId },
            data: { ownerId: null },
        });

        return NextResponse.json(updatedFoodcourt);
    } catch (error) {
        console.error('Error unassigning owner:', error);
        return NextResponse.json(
            { error: 'Failed to unassign owner' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole} from "@prisma/client";

// Schema untuk validasi input assign owner
const assignOwnerSchema = z.object({
    ownerId: z.string().min(1, 'Owner ID harus diisi'),
});

// Handler untuk mengassign owner ke foodcourt
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

        // Parse dan validasi body request
        const body = await req.json();
        const validatedData = assignOwnerSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        const { ownerId } = validatedData.data;

        // Periksa apakah owner valid dan memiliki role OWNER
        const owner = await db.user.findUnique({
            where: { id: ownerId, role: UserRole.OWNER },
        });

        if (!owner) {
            return NextResponse.json(
                { error: 'Invalid owner or owner is not a OWNER' },
                { status: 400 }
            );
        }

        // Periksa apakah owner sudah memiliki foodcourt lain
        const existingOwnership = await db.foodcourt.findFirst({
            where: { ownerId, NOT: { id: foodcourtId } },
        });

        if (existingOwnership) {
            return NextResponse.json(
                { error: 'Owner already has a foodcourt assigned' },
                { status: 400 }
            );
        }

        // Hapus owner permissions yang ada jika ada
        if (existingFoodcourt.ownerId) {
            await db.ownerPermission.deleteMany({
                where: { foodcourtId },
            });
        }

        // Update foodcourt dengan owner baru
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id: foodcourtId },
            data: { ownerId },
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

        // Buat owner permissions default
        await db.ownerPermission.create({
            data: {
                ownerId,
                foodcourtId,
                canEditMenu: true,
                canViewOrders: true,
                canUpdateOrders: true,
            },
        });

        return NextResponse.json(updatedFoodcourt);
    } catch (error) {
        console.error('Error assigning owner:', error);
        return NextResponse.json(
            { error: 'Failed to assign owner' },
            { status: 500 }
        );
    }
}
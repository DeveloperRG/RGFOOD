import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole} from "@prisma/client";

// Schema untuk validasi input update foodcourt
const updateFoodcourtSchema = z.object({
    name: z.string().min(1, 'Nama foodcourt harus diisi').optional(),
    description: z.string().optional().nullable(),
    address: z.string().min(1, 'Alamat harus diisi').optional(),
    logo: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});

// Handler untuk mendapatkan detail foodcourt
export async function GET(
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

        const { id } = await params;

        // Ambil detail foodcourt dengan owner dan creator
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                ownerPermissions: true,
            },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: 'Foodcourt not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(foodcourt);
    } catch (error) {
        console.error('Error getting foodcourt details:', error);
        return NextResponse.json(
            { error: 'Failed to get foodcourt details' },
            { status: 500 }
        );
    }
}

// Handler untuk mengupdate foodcourt
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

        const { id } = await params;

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
        const validatedData = updateFoodcourtSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        // Update foodcourt
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: validatedData.data,
        });

        return NextResponse.json(updatedFoodcourt);
    } catch (error) {
        console.error('Error updating foodcourt:', error);
        return NextResponse.json(
            { error: 'Failed to update foodcourt' },
            { status: 500 }
        );
    }
}

// Handler untuk menghapus foodcourt
export async function DELETE(
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

        const {id} = await params;

        // Periksa apakah foodcourt ada
        const existingFoodcourt = await db.foodcourt.findUnique({
            where: { id },
            include: {
                menuItems: { select: { id: true }, take: 1 },
                orderItems: { select: { id: true }, take: 1 },
            },
        });

        if (!existingFoodcourt) {
            return NextResponse.json(
                { error: 'Foodcourt not found' },
                { status: 404 }
            );
        }

        // Periksa apakah foodcourt memiliki items atau orderItems terkait
        if (existingFoodcourt.menuItems.length > 0 || existingFoodcourt.orderItems.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete foodcourt with existing menu items or orders',
                    hasMenuItems: existingFoodcourt.menuItems.length > 0,
                    hasOrderItems: existingFoodcourt.orderItems.length > 0
                },
                { status: 400 }
            );
        }

        // Hapus owner permissions terlebih dahulu jika ada
        if (existingFoodcourt.ownerId) {
            await db.ownerPermission.deleteMany({
                where: { foodcourtId: id },
            });
        }

        // Hapus foodcourt
        await db.foodcourt.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting foodcourt:', error);
        return NextResponse.json(
            { error: 'Failed to delete foodcourt' },
            { status: 500 }
        );
    }
}
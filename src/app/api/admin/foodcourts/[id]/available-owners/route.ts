import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole} from "@prisma/client";

// Handler untuk mendapatkan daftar owner yang tersedia (belum memiliki foodcourt)
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

        const foodcourtId = params.id;

        // Periksa apakah foodcourt ada
        const existingFoodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
            select: { id: true, ownerId: true },
        });

        if (!existingFoodcourt) {
            return NextResponse.json(
                { error: 'Foodcourt not found' },
                { status: 404 }
            );
        }

        // Cari user dengan role FOODCOURT_OWNER yang belum memiliki foodcourt
        // atau yang saat ini adalah pemilik dari foodcourt ini
        const availableOwners = await db.user.findMany({
            where: {
                role: UserRole.FOODCOURT_OWNER,
                AND: [
                    {
                        OR: [
                            { ownedFoodcourt: null }, // Belum memiliki foodcourt
                            { id: existingFoodcourt.ownerId || '' }, // Adalah owner saat ini
                        ],
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(availableOwners);
    } catch (error) {
        console.error('Error getting available owners:', error);
        return NextResponse.json(
            { error: 'Failed to get available owners' },
            { status: 500 }
        );
    }
}
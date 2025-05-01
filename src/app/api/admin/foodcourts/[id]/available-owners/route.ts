import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mendapatkan daftar owner yang belum memiliki foodcourt
export async function GET(req: NextRequest) {
    try {
        // Periksa autentikasi
        const session = await auth();
        if (!session || session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        // Cari user dengan role OWNER yang belum memiliki foodcourt
        const availableOwners = await db.user.findMany({
            where: {
                role: UserRole.OWNER,
                ownedFoodcourt: null, // Belum memiliki foodcourt
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
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

// Handler untuk mendapatkan daftar user berdasarkan role
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

        // Ambil parameter role dari query string
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        // Validasi role jika disediakan
        if (role && !Object.values(UserRole).includes(role as UserRole)) {
            return NextResponse.json(
                { error: 'Invalid role parameter' },
                { status: 400 }
            );
        }

        // Query untuk mencari user berdasarkan role
        const users = await db.user.findMany({
            where: role ? { role: role as UserRole } : {},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        return NextResponse.json(
            { error: 'Failed to get users' },
            { status: 500 }
        );
    }
}
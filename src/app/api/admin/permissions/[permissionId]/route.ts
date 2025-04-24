import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {db} from "~/server/db";
import { UserRole } from "@prisma/client";

// GET: Fetch a specific permission by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin
        if (session?.user?.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Fetch the permission with owner and foodcourt information
        const permission = await db.ownerPermission.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                foodcourt: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!permission) {
            return NextResponse.json(
                { error: "Permission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(permission);
    } catch (error) {
        console.error("Error fetching permission:", error);
        return NextResponse.json(
            { error: "Failed to fetch permission" },
            { status: 500 }
        );
    }
}

// PUT: Update a permission
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin
        if (session?.user?.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const { id } = params;
        const body = await req.json();
        const { canEditMenu, canViewOrders, canUpdateOrders } = body;

        // Check if permission exists
        const existingPermission = await db.ownerPermission.findUnique({
            where: { id },
        });

        if (!existingPermission) {
            return NextResponse.json(
                { error: "Permission not found" },
                { status: 404 }
            );
        }

        // Update the permission
        const updatedPermission = await db.ownerPermission.update({
            where: { id },
            data: {
                canEditMenu: canEditMenu !== undefined ? canEditMenu : existingPermission.canEditMenu,
                canViewOrders: canViewOrders !== undefined ? canViewOrders : existingPermission.canViewOrders,
                canUpdateOrders: canUpdateOrders !== undefined ? canUpdateOrders : existingPermission.canUpdateOrders,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                foodcourt: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Permission updated successfully",
            permission: updatedPermission,
        });
    } catch (error) {
        console.error("Error updating permission:", error);
        return NextResponse.json(
            { error: "Failed to update permission" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a permission
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin
        if (session?.user?.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Check if permission exists
        const permission = await db.ownerPermission.findUnique({
            where: { id },
            include: {
                owner: true,
                foodcourt: true,
            },
        });

        if (!permission) {
            return NextResponse.json(
                { error: "Permission not found" },
                { status: 404 }
            );
        }

        // Delete the permission
        await db.ownerPermission.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Permission deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting permission:", error);
        return NextResponse.json(
            { error: "Failed to delete permission" },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {db} from "~/server/db";
import { UserRole } from "@prisma/client";

// POST: Assign owner to a foodcourt
export async function POST(
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
        const { foodcourtId, permissions } = body;

        // Validate required fields
        if (!foodcourtId) {
            return NextResponse.json(
                { error: "Foodcourt ID is required" },
                { status: 400 }
            );
        }

        // Check if owner exists
        const owner = await db.user.findUnique({
            where: { id },
        });

        if (!owner) {
            return NextResponse.json(
                { error: "Owner not found" },
                { status: 404 }
            );
        }

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Ensure owner has FOODCOURT_OWNER role
        if (owner.role !== UserRole.FOODCOURT_OWNER) {
            await db.user.update({
                where: { id },
                data: { role: UserRole.FOODCOURT_OWNER },
            });
        }

        // Update the foodcourt owner
        await db.foodcourt.update({
            where: { id: foodcourtId },
            data: { ownerId: id },
        });

        // Default permissions
        const defaultPermissions = {
            canEditMenu: true,
            canViewOrders: true,
            canUpdateOrders: true,
        };

        // Use provided permissions or defaults
        const permissionsData = permissions || defaultPermissions;

        // Check if permissions already exist for this owner-foodcourt pair
        const existingPermission = await db.ownerPermission.findUnique({
            where: {
                ownerId_foodcourtId: {
                    ownerId: id,
                    foodcourtId: foodcourtId,
                },
            },
        });

        let ownerPermission;

        if (existingPermission) {
            // Update existing permissions
            ownerPermission = await db.ownerPermission.update({
                where: {
                    ownerId_foodcourtId: {
                        ownerId: id,
                        foodcourtId: foodcourtId,
                    },
                },
                data: permissionsData,
            });
        } else {
            // Create new permissions
            ownerPermission = await db.ownerPermission.create({
                data: {
                    ownerId: id,
                    foodcourtId: foodcourtId,
                    ...permissionsData,
                },
            });
        }

        return NextResponse.json({
            message: "Owner assigned to foodcourt successfully",
            ownerPermission,
        });
    } catch (error) {
        console.error("Error assigning owner to foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to assign owner to foodcourt" },
            { status: 500 }
        );
    }
}

// DELETE: Remove owner from a foodcourt
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
        const searchParams = req.nextUrl.searchParams;
        const foodcourtId = searchParams.get("foodcourtId");

        if (!foodcourtId) {
            return NextResponse.json(
                { error: "Foodcourt ID is required" },
                { status: 400 }
            );
        }

        // Check if owner exists
        const owner = await db.user.findUnique({
            where: { id },
        });

        if (!owner) {
            return NextResponse.json(
                { error: "Owner not found" },
                { status: 404 }
            );
        }

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Check if this owner is actually assigned to this foodcourt
        if (foodcourt.ownerId !== id) {
            return NextResponse.json(
                { error: "This owner is not assigned to this foodcourt" },
                { status: 400 }
            );
        }

        // Use a transaction to ensure all operations succeed or fail together
        await db.$transaction([
            // Remove owner from foodcourt
            db.foodcourt.update({
                where: { id: foodcourtId },
                data: { ownerId: null },
            }),
            // Delete owner permissions for this foodcourt
            db.ownerPermission.deleteMany({
                where: {
                    ownerId: id,
                    foodcourtId: foodcourtId,
                },
            }),
        ]);

        return NextResponse.json({
            message: "Owner removed from foodcourt successfully",
        });
    } catch (error) {
        console.error("Error removing owner from foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to remove owner from foodcourt" },
            { status: 500 }
        );
    }
}
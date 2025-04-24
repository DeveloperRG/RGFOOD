import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {db} from "~/server/db";
import { UserRole } from "@prisma/client";

// GET: Fetch a specific foodcourt by ID
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

        // Fetch the foodcourt with owner and creator information
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                ownerPermissions: true,
            },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(foodcourt);
    } catch (error) {
        console.error("Error fetching foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to fetch foodcourt" },
            { status: 500 }
        );
    }
}

// PUT: Update a foodcourt
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
        const { name, description, address, logo, isActive, ownerId } = body;

        // Check if foodcourt exists
        const existingFoodcourt = await db.foodcourt.findUnique({
            where: { id },
            include: { ownerPermissions: true },
        });

        if (!existingFoodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // If owner is being changed, verify the new owner exists
        if (ownerId && ownerId !== existingFoodcourt.ownerId) {
            const owner = await db.user.findUnique({
                where: { id: ownerId },
            });

            if (!owner) {
                return NextResponse.json(
                    { error: "Owner not found" },
                    { status: 404 }
                );
            }

            // If owner is not a FOODCOURT_OWNER, update their role
            if (owner.role !== UserRole.FOODCOURT_OWNER) {
                await db.user.update({
                    where: { id: ownerId },
                    data: { role: UserRole.FOODCOURT_OWNER },
                });
            }
        }

        // Create update object with only provided fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (address !== undefined) updateData.address = address;
        if (logo !== undefined) updateData.logo = logo;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Handle owner assignment/unassignment
        const previousOwnerId = existingFoodcourt.ownerId;

        // Set ownerId to null explicitly if ownerId is null in request
        // Otherwise only update it if it's provided and different
        if (ownerId === null) {
            updateData.ownerId = null;
        } else if (ownerId !== undefined && ownerId !== previousOwnerId) {
            updateData.ownerId = ownerId;
        }

        // Update foodcourt
        const updatedFoodcourt = await db.foodcourt.update({
            where: { id },
            data: updateData,
        });

        // Owner permission handling logic
        if (previousOwnerId !== updatedFoodcourt.ownerId) {
            // If there was a previous owner, delete their permissions
            if (previousOwnerId) {
                await db.ownerPermission.deleteMany({
                    where: {
                        ownerId: previousOwnerId,
                        foodcourtId: id,
                    },
                });
            }

            // If there's a new owner, create default permissions
            if (updatedFoodcourt.ownerId) {
                // Check if permissions already exist
                const existingPermissions = await db.ownerPermission.findUnique({
                    where: {
                        ownerId_foodcourtId: {
                            ownerId: updatedFoodcourt.ownerId,
                            foodcourtId: id,
                        },
                    },
                });

                // Only create if no permissions exist
                if (!existingPermissions) {
                    await db.ownerPermission.create({
                        data: {
                            ownerId: updatedFoodcourt.ownerId,
                            foodcourtId: id,
                            canEditMenu: true,
                            canViewOrders: true,
                            canUpdateOrders: true,
                        },
                    });
                }
            }
        }

        return NextResponse.json({
            message: "Foodcourt updated successfully",
            foodcourt: updatedFoodcourt,
        });
    } catch (error) {
        console.error("Error updating foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to update foodcourt" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a foodcourt
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

        // Check if foodcourt exists
        const foodcourt = await db.foodcourt.findUnique({
            where: { id },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
                { status: 404 }
            );
        }

        // Delete related records first to maintain referential integrity
        // Use a transaction to ensure all operations succeed or fail together
        await db.$transaction([
            // Delete owner permissions for this foodcourt
            db.ownerPermission.deleteMany({
                where: { foodcourtId: id },
            }),
            // Delete owner notifications
            db.ownerNotification.deleteMany({
                where: { foodcourtId: id },
            }),
            // Delete menu items and associated order items
            // First, get all menu item IDs for this foodcourt
            db.menuItem.findMany({
                where: { foodcourtId: id },
                select: { id: true },
            }).then(async (menuItems) => {
                const menuItemIds = menuItems.map(item => item.id);
                if (menuItemIds.length > 0) {
                    // Delete order items associated with these menu items
                    await db.orderItem.deleteMany({
                        where: { menuItemId: { in: menuItemIds } },
                    });
                }
            }),
            // Now delete the menu items
            db.menuItem.deleteMany({
                where: { foodcourtId: id },
            }),
            // Delete menu categories
            db.menuCategory.deleteMany({
                where: { foodcourtId: id },
            }),
            // Finally delete the foodcourt itself
            db.foodcourt.delete({
                where: { id },
            }),
        ]);

        return NextResponse.json({
            message: "Foodcourt deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to delete foodcourt" },
            { status: 500 }
        );
    }
}
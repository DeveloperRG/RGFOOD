import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {db} from "~/server/db";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

// GET: Fetch a specific owner by ID
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

        // Fetch the owner with related data
        const owner = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                emailVerified: true,
                image: true,
                role: true,
                createdAt: true,
                lastLogin: true,
                ownedFoodcourts: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        address: true,
                        logo: true,
                        isActive: true,
                    },
                },
                permissions: {
                    select: {
                        id: true,
                        foodcourtId: true,
                        canEditMenu: true,
                        canViewOrders: true,
                        canUpdateOrders: true,
                        foodcourt: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!owner) {
            return NextResponse.json(
                { error: "Owner not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(owner);
    } catch (error) {
        console.error("Error fetching owner:", error);
        return NextResponse.json(
            { error: "Failed to fetch owner" },
            { status: 500 }
        );
    }
}

// PUT: Update an owner
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
        const { name, email, username, password, image } = body;

        // Check if owner exists
        const existingOwner = await db.user.findUnique({
            where: { id },
        });

        if (!existingOwner) {
            return NextResponse.json(
                { error: "Owner not found" },
                { status: 404 }
            );
        }

        // If email or username is being updated, check for duplicates
        if ((email && email !== existingOwner.email) || (username && username !== existingOwner.username)) {
            const duplicateCheck = await db.user.findFirst({
                where: {
                    OR: [
                        email ? { email } : {},
                        username ? { username } : {},
                    ],
                    NOT: {
                        id,
                    },
                },
            });

            if (duplicateCheck) {
                return NextResponse.json(
                    { error: "Email or username already in use" },
                    { status: 409 }
                );
            }
        }

        // Create update data object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (username !== undefined) updateData.username = username;
        if (image !== undefined) updateData.image = image;

        // Hash password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update owner
        const updatedOwner = await db.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                emailVerified: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Don't return the password
            },
        });

        return NextResponse.json({
            message: "Owner updated successfully",
            owner: updatedOwner,
        });
    } catch (error) {
        console.error("Error updating owner:", error);
        return NextResponse.json(
            { error: "Failed to update owner" },
            { status: 500 }
        );
    }
}

// DELETE: Delete an owner
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

        // Check if owner exists
        const owner = await db.user.findUnique({
            where: { id },
            include: {
                ownedFoodcourts: true,
            },
        });

        if (!owner) {
            return NextResponse.json(
                { error: "Owner not found" },
                { status: 404 }
            );
        }

        // Check if owner has any foodcourts assigned
        if (owner.ownedFoodcourts.length > 0) {
            // If we want to delete the owner anyway, we can update foodcourts to remove the owner
            await db.foodcourt.updateMany({
                where: { ownerId: id },
                data: { ownerId: null },
            });
        }

        // Use a transaction to ensure all operations succeed or fail together
        await db.$transaction([
            // Delete owner permissions
            db.ownerPermission.deleteMany({
                where: { ownerId: id },
            }),
            // Delete owner account
            db.user.delete({
                where: { id },
            }),
        ]);

        return NextResponse.json({
            message: "Owner deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting owner:", error);
        return NextResponse.json(
            { error: "Failed to delete owner" },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {db} from "~/server/db";
import { UserRole } from "@prisma/client";

// GET: Fetch all permissions with optional filtering
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin
        if (session?.user?.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        // Parse query parameters
        const searchParams = req.nextUrl.searchParams;
        const ownerId = searchParams.get("ownerId");
        const foodcourtId = searchParams.get("foodcourtId");

        // Build where clause based on provided filters
        const where: any = {};
        if (ownerId) where.ownerId = ownerId;
        if (foodcourtId) where.foodcourtId = foodcourtId;

        // Fetch permissions with owner and foodcourt information
        const permissions = await db.ownerPermission.findMany({
            where,
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
            orderBy: { foodcourtId: "asc" },
        });

        return NextResponse.json({ permissions });
    } catch (error) {
        console.error("Error fetching permissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch permissions" },
            { status: 500 }
        );
    }
}

// POST: Create or update permission
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin
        if (session?.user?.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { ownerId, foodcourtId, canEditMenu, canViewOrders, canUpdateOrders } = body;

        // Validate required fields
        if (!ownerId || !foodcourtId) {
            return NextResponse.json(
                { error: "Owner ID and Foodcourt ID are required" },
                { status: 400 }
            );
        }

        // Check if owner exists
        const owner = await db.user.findUnique({
            where: { id: ownerId },
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

        // Check if permissions already exist for this owner-foodcourt pair
        const existingPermission = await db.ownerPermission.findUnique({
            where: {
                ownerId_foodcourtId: {
                    ownerId,
                    foodcourtId,
                },
            },
        });

        let permission;
        let message;

        if (existingPermission) {
            // Update existing permissions
            permission = await db.ownerPermission.update({
                where: {
                    ownerId_foodcourtId: {
                        ownerId,
                        foodcourtId,
                    },
                },
                data: {
                    canEditMenu: canEditMenu ?? existingPermission.canEditMenu,
                    canViewOrders: canViewOrders ?? existingPermission.canViewOrders,
                    canUpdateOrders: canUpdateOrders ?? existingPermission.canUpdateOrders,
                },
            });
            message = "Permissions updated successfully";
        } else {
            // Create new permissions
            permission = await db.ownerPermission.create({
                data: {
                    ownerId,
                    foodcourtId,
                    canEditMenu: canEditMenu ?? true,
                    canViewOrders: canViewOrders ?? true,
                    canUpdateOrders: canUpdateOrders ?? true,
                },
            });
            message = "Permissions created successfully";
        }

        return NextResponse.json({
            message,
            permission,
        });
    } catch (error) {
        console.error("Error managing permissions:", error);
        return NextResponse.json(
            { error: "Failed to manage permissions" },
            { status: 500 }
        );
    }
}
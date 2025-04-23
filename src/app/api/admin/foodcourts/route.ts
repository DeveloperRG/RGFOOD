// noinspection TypeScriptValidateTypes

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema validasi untuk create foodcourt
const createFoodcourtSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters"),
    logo: z.string().optional(),
    isActive: z.boolean().default(true),
    ownerId: z.string().optional().nullable(),
    permissions: z.object({
        canEditMenu: z.boolean().default(true),
        canViewOrders: z.boolean().default(true),
        canUpdateOrders: z.boolean().default(true),
    }).optional(),
});

export async function GET(req: NextRequest) {
    // Auth check
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        // noinspection TypeScriptValidateTypes
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        // Parse query params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const isActive = searchParams.get("isActive");

        // Build filters
        const filters: any = {};
        if (isActive !== null) {
            filters.isActive = isActive === "true";
        }
        if (search) {
            filters.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Get total count
        const total = await db.foodcourt.count({
            where: filters,
        });


        // Get paginated foodcourts
        const foodcourts = await db.foodcourt.findMany({
            where: filters,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                creator: { // Add creator info
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            data: foodcourts,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching foodcourts:", error);
        // noinspection TypeScriptValidateTypes
        return NextResponse.json(
            { error: "Failed to fetch foodcourts" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    // Auth check
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();

        // Validate input
        const validatedData = createFoodcourtSchema.parse(body);
        const { ownerId, permissions, ...foodcourtData } = validatedData;

        // Use transaction for consistency
        const result = await db.$transaction(async (tx) => {
            // Create foodcourt - with creatorId set to admin and optional ownerId
            const foodcourt = await tx.foodcourt.create({
                data: {
                    ...foodcourtData,
                    creator: {
                        connect: { id: session.user.id }  // Admin as creator
                    },
                    ...(ownerId ? { owner: { connect: { id: ownerId } } } : {}), // Optional owner
                },
            });

            // Create permissions if owner is assigned
            if (ownerId && permissions) {
                await tx.ownerPermission.create({
                    data: {
                        ownerId,
                        foodcourtId: foodcourt.id,
                        ...permissions,
                    },
                });
            }

            return foodcourt;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating foodcourt:", error);
        return NextResponse.json(
            { error: "Failed to create foodcourt" },
            { status: 500 }
        );
    }
}
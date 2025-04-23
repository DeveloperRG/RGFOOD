// noinspection TypeScriptValidateTypes

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
    // Auth check
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        // Get current owner ID if updating existing foodcourt
        const { searchParams } = new URL(req.url);
        const currentOwnerId = searchParams.get("currentOwnerId");

        // Base query - get users with FOODCOURT_OWNER role
        const baseQuery = {
            where: {
                role: "FOODCOURT_OWNER",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        };

        let availableOwners;

        if (currentOwnerId) {
            // If we're editing and have a current owner, include them in results
            // along with owners that don't have a foodcourt
            availableOwners = await db.user.findMany({
                ...baseQuery,
                where: {
                    ...baseQuery.where,
                    OR: [
                        { id: currentOwnerId },
                        { ownedFoodcourts: { none: {} } }, // Changed from foodcourts to ownedFoodcourts
                    ],
                },
            });
        } else {
            // For new foodcourts, only show owners without a foodcourt
            availableOwners = await db.user.findMany({
                ...baseQuery,
                where: {
                    ...baseQuery.where,
                    ownedFoodcourts: { none: {} }, // Changed from foodcourts to ownedFoodcourts
                },
            });
        }

        return NextResponse.json(availableOwners);
    } catch (error) {
        console.error("Error fetching available owners:", error);
        return NextResponse.json(
            { error: "Failed to fetch available owners" },
            { status: 500 }
        );
    }
}
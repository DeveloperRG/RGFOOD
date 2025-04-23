import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
) {
    try {
        const foodcourt = await db.foodcourt.findUnique({
            include: {
                owner: {
                },
                    },
            },
        });

        if (!foodcourt) {
            return NextResponse.json(
                { error: "Foodcourt not found" },
            );
        }

    } catch (error) {
        return NextResponse.json(
        );
    }
}

export async function PUT(
) {
    try {
        }

        const updatedFoodcourt = await db.foodcourt.update({
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update foodcourt" },
        );
    }
}

export async function DELETE(
) {
    try {
        }

        await db.foodcourt.delete({
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete foodcourt" },
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";


    try {


        const foodcourts = await db.foodcourt.findMany({
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch foodcourts" },
        );
    }
}

    try {



                    data: {
                        ownerId,
                    },
                });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create foodcourt" },
        );
    }
}
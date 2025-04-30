// app/api/public/foodcourt/[foodcourtId]/categories/route.ts


// import { db } from "~/server/db";
// import { NextRequest, NextResponse } from "next/server";

// interface RouteParams {
//   params: {
//     foodcourtId: string;
//   };
// }

// export async function GET(request: NextRequest, { params }: RouteParams) {
//   try {
//     const { foodcourtId } = params;

//     if (!foodcourtId) {
//       return NextResponse.json(
//         { error: "Foodcourt ID is required" },
//         { status: 400 },
//       );
//     }

//     const foodcourt = await db.foodcourt.findUnique({
//       where: {
//         id: foodcourtId,
//         isActive: true,
//       },
//       select: { id: true },
//     });

//     if (!foodcourt) {
//       return NextResponse.json(
//         { error: "Foodcourt not found" },
//         { status: 404 },
//       );
//     }

//     const categories = await db.foodcourtCategory.findMany({
//       where: {
//         foodcourtId: foodcourtId,
//       },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         displayOrder: true,
//       },
//       orderBy: {
//         displayOrder: "asc",
//       },
//     });

//     return NextResponse.json(categories, { status: 200 });
//   } catch (error) {
//     console.error("[FOODCOURT_CATEGORIES_GET]", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

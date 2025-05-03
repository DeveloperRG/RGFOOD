// import { NextRequest, NextResponse } from "next/server";
// import { db } from "~/server/db";
// import { randomUUID } from "crypto";

// /**
//  * GET - Create a new cart with session ID
//  */
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const tableId = searchParams.get("tableId");

//     if (!tableId) {
//       return NextResponse.json(
//         { error: "Table ID is required" },
//         { status: 400 },
//       );
//     }

//     // Check if table exists
//     const table = await db.table.findUnique({
//       where: { id: tableId },
//     });

//     if (!table) {
//       return NextResponse.json({ error: "Table not found" }, { status: 404 });
//     }

//     // Generate a unique session ID
//     const sessionId = randomUUID();

//     // Create a new cart
//     const cart = await db.cart.create({
//       data: {
//         sessionId,
//         tableId,
//         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // Expires in 2 hours
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       cart: {
//         id: cart.id,
//         sessionId: cart.sessionId,
//         tableId: cart.tableId,
//         createdAt: cart.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating cart:", error);
//     return NextResponse.json(
//       { error: "Failed to create cart" },
//       { status: 500 },
//     );
//   }
// }

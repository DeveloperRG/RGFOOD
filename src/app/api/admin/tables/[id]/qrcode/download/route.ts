import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { generateQrCodeWithLogoBuffer, generateTableQrCodeUrl } from "~/lib/qrcode-utils";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/tables/[id]/qrcode/download
 * Download QR code for a specific table as a PNG file
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Get table details
    const table = await db.table.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        tableNumber: true,
        qrCode: true,
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Generate QR code buffer with logo
    const qrCodeUrl = table.qrCode || generateTableQrCodeUrl(table.id);
    const qrCodeBuffer = await generateQrCodeWithLogoBuffer(qrCodeUrl);

    // Create response with appropriate headers for file download
    const response = new NextResponse(qrCodeBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="table-${table.tableNumber}-qrcode.png"`,
      },
    });

    return response;
  } catch (error) {
    console.error("[ADMIN_TABLE_QRCODE_DOWNLOAD]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

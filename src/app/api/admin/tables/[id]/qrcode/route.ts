import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { generateQrCodeWithLogo, generateTableQrCodeUrl } from "~/lib/qrcode-utils";


/**
 * GET /api/admin/tables/[id]/qrcode
 * Retrieve QR code for a specific table
 */
export async function GET(req: NextRequest,{params} : {params: {id: string}}) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
          { error: "Unauthorized: Admin access required" },
          { status: 403 }
      );
    }

    const { id } = await params;

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

    // Generate QR code data URL with logo
    const qrCodeUrl = table.qrCode || generateTableQrCodeUrl(table.id);
    const qrCodeDataUrl = await generateQrCodeWithLogo(qrCodeUrl);

    // Format response
    const response = {
      tableId: table.id,
      tableNumber: table.tableNumber,
      qrCodeUrl: qrCodeUrl,
      qrCodeDataUrl: qrCodeDataUrl,
      downloadUrl: `/api/admin/tables/${table.id}/qrcode/download`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_TABLE_QRCODE_GET]", error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}

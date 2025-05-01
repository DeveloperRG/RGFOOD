import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { uploadImage } from "~/lib/cloudinary-utils";

// Schema untuk validasi input update foodcourt
const updateFoodcourtSchema = z.object({
  name: z.string().min(1, "Nama foodcourt harus diisi").optional(),
  description: z.string().optional().nullable(),
  address: z.string().min(1, "Alamat harus diisi").optional(),
  image: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  status: z.enum(["BUKA", "TUTUP"]).optional(), // Added status field
  ownerId: z.string().optional().nullable(),
});

// Handler untuk mendapatkan detail foodcourt
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const id = params.id;

    // Ambil detail foodcourt dengan owner dan creator
    const foodcourt = await db.foodcourt.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ownerPermissions: true,
      },
    });

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(foodcourt);
  } catch (error) {
    console.error("Error getting foodcourt details:", error);
    return NextResponse.json(
      { error: "Failed to get foodcourt details" },
      { status: 500 },
    );
  }
}

// Handler untuk mengupdate foodcourt
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const id = params.id;

    // Periksa apakah foodcourt ada
    const existingFoodcourt = await db.foodcourt.findUnique({
      where: { id },
    });

    if (!existingFoodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Handle multipart/form-data or application/json
    let foodcourtData;
    let imageFile;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data with image
      const formData = await req.formData();

      foodcourtData = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        address: formData.get("address") as string,
        isActive:
          formData.get("isActive") === "true" ||
          formData.get("isActive") === "on",
        status:
          (formData.get("status") as "BUKA" | "TUTUP") ||
          existingFoodcourt.status, // Added status field
        ownerId: (formData.get("ownerId") as string) || null,
        image: existingFoodcourt.image,
        imagePublicId: existingFoodcourt.imagePublicId,
      };

      imageFile = formData.get("image") as File;
    } else {
      // Handle JSON data
      foodcourtData = await req.json();
    }

    // Parse dan validasi data
    const validatedData = updateFoodcourtSchema.safeParse(foodcourtData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 },
      );
    }

    // Handle image upload if present
    let image =
      validatedData.data.image !== undefined
        ? validatedData.data.image
        : existingFoodcourt.image;
    let imagePublicId =
      validatedData.data.imagePublicId !== undefined
        ? validatedData.data.imagePublicId
        : existingFoodcourt.imagePublicId;

    if (imageFile && imageFile.size > 0) {
      try {
        // Convert file to buffer for server-side upload
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await uploadImage(buffer, "foodcourts");

        image = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      } catch (error) {
        console.error("Image upload failed:", error);
        // Continue without changing image if upload fails
      }
    }

    // Update foodcourt dengan data valid dan gambar baru jika ada
    const updatedFoodcourt = await db.foodcourt.update({
      where: { id },
      data: {
        ...validatedData.data,
        image,
        imagePublicId,
      },
    });

    return NextResponse.json(updatedFoodcourt);
  } catch (error) {
    console.error("Error updating foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to update foodcourt" },
      { status: 500 },
    );
  }
}

// Handler untuk menghapus foodcourt
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const id = params.id;

    // Periksa apakah foodcourt ada
    const existingFoodcourt = await db.foodcourt.findUnique({
      where: { id },
      include: {
        menuItems: { select: { id: true }, take: 1 },
        orderItems: { select: { id: true }, take: 1 },
      },
    });

    if (!existingFoodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Periksa apakah foodcourt memiliki items atau orderItems terkait
    if (
      existingFoodcourt.menuItems.length > 0 ||
      existingFoodcourt.orderItems.length > 0
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete foodcourt with existing menu items or orders",
          hasMenuItems: existingFoodcourt.menuItems.length > 0,
          hasOrderItems: existingFoodcourt.orderItems.length > 0,
        },
        { status: 400 },
      );
    }

    // Hapus owner permissions terlebih dahulu jika ada
    if (existingFoodcourt.ownerId) {
      await db.ownerPermission.deleteMany({
        where: { foodcourtId: id },
      });
    }

    // Hapus foodcourt
    await db.foodcourt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to delete foodcourt" },
      { status: 500 },
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole, Prisma } from "@prisma/client";
import { uploadImage } from "~/lib/cloudinary-utils";

// Schema untuk validasi input pembuatan foodcourt
const createFoodcourtSchema = z.object({
  name: z.string().min(1, "Nama foodcourt harus diisi"),
  description: z.string().optional(),
  address: z.string().min(1, "Alamat harus diisi"),
  isActive: z.boolean().default(true),
  ownerId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
});

// Handler untuk mendapatkan daftar foodcourt
export async function GET(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    // Ambil query parameters
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const isActive = searchParams.get("isActive");
    const ownerId = searchParams.get("ownerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Buat filter object untuk Prisma
    const filter: Prisma.FoodcourtWhereInput = {};

    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }

    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (ownerId) {
      if (ownerId === "unassigned") {
        filter.ownerId = null;
      } else {
        filter.ownerId = ownerId;
      }
    }

    // Ambil data foodcourt dengan filter
    const [foodcourts, total] = await Promise.all([
      db.foodcourt.findMany({
        where: filter,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.foodcourt.count({ where: filter }),
    ]);

    return NextResponse.json({
      data: foodcourts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting foodcourts:", error);
    return NextResponse.json(
      { error: "Failed to get foodcourts" },
      { status: 500 },
    );
  }
}

// Handler untuk membuat foodcourt baru
export async function POST(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await auth();
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
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
        ownerId: (formData.get("ownerId") as string) || null,
      };

      imageFile = formData.get("image") as File;
    } else {
      // Handle JSON data
      foodcourtData = await req.json();
    }

    // Validate the core foodcourt data
    const validatedData = createFoodcourtSchema.safeParse(foodcourtData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten() },
        { status: 400 },
      );
    }

    // Handle image upload if present
    let image = foodcourtData.image;
    let imagePublicId = foodcourtData.imagePublicId;

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
        // Continue without image if upload fails
      }
    }

    // Buat foodcourt baru
    const foodcourt = await db.foodcourt.create({
      data: {
        ...validatedData.data,
        image,
        imagePublicId,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(foodcourt, { status: 201 });
  } catch (error) {
    console.error("Error creating foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to create foodcourt" },
      { status: 500 },
    );
  }
}

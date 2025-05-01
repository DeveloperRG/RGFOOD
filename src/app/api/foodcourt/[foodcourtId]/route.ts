import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { FoodcourtStatus } from "@prisma/client";
import { z } from "zod";
import { deleteImage, uploadImage } from "~/lib/cloudinary-utils";

// Schema for validation
const foodcourtUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullish(),
  address: z.string().min(1).optional(),
  image: z.string().nullish(),
  imagePublicId: z.string().nullish(),
  isActive: z.boolean().optional(),
});

const foodcourtStatusSchema = z.object({
  status: z.nativeEnum(FoodcourtStatus),
});

// Helper function to get foodcourt by ID or owner ID
async function getFoodcourtId(idParam: string) {
  // First try to find by foodcourt ID
  let foodcourt = await db.foodcourt.findUnique({
    where: { id: idParam },
    select: { id: true },
  });

  // If not found, try to find by owner ID
  if (!foodcourt) {
    foodcourt = await db.foodcourt.findUnique({
      where: { ownerId: idParam },
      select: { id: true },
    });
  }

  return foodcourt?.id;
}

// GET handler: Get foodcourt details
export async function GET(
  req: NextRequest,
  { params }: { params: { foodcourtId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get foodcourt ID (works with either foodcourt ID or owner ID)
    const foodcourtId = await getFoodcourtId(params.foodcourtId);

    if (!foodcourtId) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    const foodcourt = await db.foodcourt.findUnique({
      where: { id: foodcourtId },
      include: {
        categories: true,
        menuItems: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
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
    console.error("Error fetching foodcourt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT handler: Edit foodcourt details
export async function PUT(
  req: NextRequest,
  { params }: { params: { foodcourtId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get foodcourt ID (works with either foodcourt ID or owner ID)
    const foodcourtId = await getFoodcourtId(params.foodcourtId);

    if (!foodcourtId) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    const userId = session.user.id;

    // Check if user has permission to edit this foodcourt
    const permission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: userId,
          foodcourtId: foodcourtId,
        },
      },
    });

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = await db.foodcourt.findFirst({
      where: {
        id: foodcourtId,
        ownerId: userId,
      },
    });

    if (!isAdmin && !isOwner && !permission) {
      return NextResponse.json(
        { error: "You don't have permission to edit this foodcourt" },
        { status: 403 },
      );
    }

    // Handle different content types
    let updateData: any = {};
    let imagePublicId: string | null = null;
    let imageUrl: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    // Check if the request is FormData (from frontend image upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Extract text fields
      if (formData.has("name"))
        updateData.name = formData.get("name") as string;
      if (formData.has("description"))
        updateData.description = formData.get("description") as string;
      if (formData.has("address"))
        updateData.address = formData.get("address") as string;

      // Handle image upload if there's a file
      const imageFile = formData.get("image") as File | null;

      if (imageFile && imageFile.size > 0) {
        try {
          // Get current image to potentially delete
          const currentFoodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
            select: { imagePublicId: true },
          });

          // Upload the new image
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const uploadResult = await uploadImage(buffer, "foodcourts");
          imageUrl = uploadResult.secure_url;
          imagePublicId = uploadResult.public_id;

          // Add to update data
          updateData.image = imageUrl;
          updateData.imagePublicId = imagePublicId;

          // Delete old image if it exists
          if (currentFoodcourt?.imagePublicId) {
            try {
              await deleteImage(currentFoodcourt.imagePublicId);
              console.log(
                `Deleted old foodcourt image: ${currentFoodcourt.imagePublicId}`,
              );
            } catch (error) {
              console.error("Error deleting old image:", error);
              // Continue with update even if image deletion fails
            }
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 },
          );
        }
      }
    } else {
      // It's JSON data
      try {
        const body = await req.json();
        const validatedData = foodcourtUpdateSchema.safeParse(body);

        if (!validatedData.success) {
          return NextResponse.json(
            { error: validatedData.error.format() },
            { status: 400 },
          );
        }

        updateData = validatedData.data;

        // Check if image is being updated via JSON
        if (updateData.imagePublicId !== undefined) {
          // Get current image to potentially delete
          const currentFoodcourt = await db.foodcourt.findUnique({
            where: { id: foodcourtId },
            select: { imagePublicId: true },
          });

          // If there's a new image and there was an old image, delete the old one
          if (
            currentFoodcourt?.imagePublicId &&
            updateData.imagePublicId !== currentFoodcourt.imagePublicId &&
            updateData.imagePublicId !== null
          ) {
            try {
              await deleteImage(currentFoodcourt.imagePublicId);
              console.log(
                `Deleted old foodcourt image: ${currentFoodcourt.imagePublicId}`,
              );
            } catch (error) {
              console.error("Error deleting old image:", error);
              // Continue with update even if image deletion fails
            }
          }
        }
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 },
        );
      }
    }

    // Update the foodcourt with the collected data
    const updatedFoodcourt = await db.foodcourt.update({
      where: { id: foodcourtId },
      data: updateData,
    });

    return NextResponse.json(updatedFoodcourt);
  } catch (error) {
    console.error("Error updating foodcourt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH handler: Update foodcourt status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { foodcourtId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get foodcourt ID (works with either foodcourt ID or owner ID)
    const foodcourtId = await getFoodcourtId(params.foodcourtId);

    if (!foodcourtId) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    const userId = session.user.id;

    // Check if user has permission to update this foodcourt
    const permission = await db.ownerPermission.findUnique({
      where: {
        ownerId_foodcourtId: {
          ownerId: userId,
          foodcourtId: foodcourtId,
        },
      },
    });

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = await db.foodcourt.findFirst({
      where: {
        id: foodcourtId,
        ownerId: userId,
      },
    });

    if (!isAdmin && !isOwner && !permission) {
      return NextResponse.json(
        { error: "You don't have permission to update this foodcourt status" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validatedData = foodcourtStatusSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 },
      );
    }

    const updatedFoodcourt = await db.foodcourt.update({
      where: { id: foodcourtId },
      data: {
        status: validatedData.data.status,
      },
    });

    return NextResponse.json(updatedFoodcourt);
  } catch (error) {
    console.error("Error updating foodcourt status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { deleteImage, uploadImage } from "~/lib/cloudinary-utils";

// GET /api/foodcourt/[foodcourtId]/menu/[menuId] - Get menu item detail
export async function GET(
  request: NextRequest,
  { params }: { params: { foodcourtId: string; menuId: string } },
) {
  try {
    const session = await auth();

    if (!params.foodcourtId || !params.menuId || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let foodcourt = null;

    // Try getting foodcourt from path param (could be foodcourt ID)
    foodcourt = await db.foodcourt.findUnique({
      where: { id: params.foodcourtId },
    });

    // If not found, check if the param is an owner ID
    if (!foodcourt) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: params.foodcourtId },
      });
    }

    // If still not found but we have a session user, try getting their foodcourt
    if (!foodcourt && session?.user?.id) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: session.user.id },
      });
    }

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    const menuItem = await db.menuItem.findFirst({
      where: {
        id: params.menuId,
        foodcourtId: foodcourt.id,
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ menuItem }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// PATCH /api/foodcourt/[foodcourtId]/menu/[menuId] - Update a menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { foodcourtId: string; menuId: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get foodcourt either from param or by owner ID
    let foodcourt = null;
    if (params.foodcourtId) {
      foodcourt = await db.foodcourt.findUnique({
        where: { id: params.foodcourtId },
      });
    }

    // If not found, check if the param is an owner ID
    if (!foodcourt) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: params.foodcourtId },
      });
    }

    // If still not found but we have a session user, try getting their foodcourt
    if (!foodcourt && session?.user?.id) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: session.user.id },
      });
    }

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Check permission
    const [userPermission, user] = await Promise.all([
      db.ownerPermission.findUnique({
        where: {
          ownerId_foodcourtId: {
            ownerId: session.user.id,
            foodcourtId: foodcourt.id,
          },
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      }),
    ]);

    const isAdmin = user?.role === "ADMIN";
    const isFoodcourtOwner = user?.role === "OWNER";
    const hasPermission =
      !!userPermission?.canEditMenu || foodcourt.ownerId === session.user.id;

    if (
      !hasPermission &&
      !isAdmin &&
      (!isFoodcourtOwner || foodcourt.ownerId !== session.user.id)
    ) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to update menu items for this foodcourt",
        },
        { status: 403 },
      );
    }

    // Get current menu item to check if we need to delete old image
    const currentMenuItem = await db.menuItem.findUnique({
      where: { id: params.menuId },
    });

    if (!currentMenuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Handle different content types (JSON or multipart form data)
    let data;
    let imageFile;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data with image file
      const formData = await request.formData();
      console.log("Received form data for menu item update");

      data = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || "",
        price: parseFloat(formData.get("price") as string),
        isAvailable: formData.get("isAvailable") === "true",
        categoryId: (formData.get("categoryId") as string) || null,
        image: (formData.get("image") as string) || currentMenuItem.image,
        imagePublicId:
          (formData.get("imagePublicId") as string) ||
          currentMenuItem.imagePublicId,
      };

      imageFile = formData.get("image") as File;

      // Check if image is a string URL from previous upload or a new File
      if (imageFile instanceof File) {
        console.log("New image file detected:", imageFile.name);
      } else {
        // If it's a string, it's the original image URL - not a new file
        imageFile = null;
      }

      console.log("Extracted form data:", {
        ...data,
        hasImage: !!imageFile,
        imageType: imageFile ? typeof imageFile : "string URL",
      });
    } else {
      // Handle JSON data
      data = await request.json();
    }

    const {
      name,
      description,
      price,
      image,
      imagePublicId,
      isAvailable,
      categoryId,
    } = data;

    // Handle price conversion if it's a string
    let priceValue: number | undefined = undefined;
    if (price !== undefined) {
      priceValue = typeof price === "string" ? parseFloat(price) : price;
      if (priceValue !== undefined && isNaN(priceValue)) {
        return NextResponse.json(
          { error: "Invalid price format" },
          { status: 400 },
        );
      }
    }

    // Handle image upload if there's a new file
    let finalImage = currentMenuItem.image;
    let finalImagePublicId = currentMenuItem.imagePublicId;

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      try {
        console.log("Processing new image upload...");
        // Convert file to buffer for server-side upload
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await uploadImage(buffer, "menu-items");

        finalImage = uploadResult.secure_url;
        finalImagePublicId = uploadResult.public_id;

        console.log("Image uploaded successfully:", {
          imageUrl: finalImage,
          publicId: finalImagePublicId,
        });

        // Delete old image if it exists
        if (currentMenuItem.imagePublicId) {
          try {
            await deleteImage(currentMenuItem.imagePublicId);
            console.log(
              `Deleted old menu item image: ${currentMenuItem.imagePublicId}`,
            );
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
            // Continue with update even if image deletion fails
          }
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        // Continue with update using existing image
      }
    } else if (image === null || image === "") {
      // If image is explicitly set to null/empty, remove the image
      finalImage = null;

      // Delete old image if it exists
      if (currentMenuItem.imagePublicId) {
        try {
          await deleteImage(currentMenuItem.imagePublicId);
          console.log(
            `Deleted menu item image: ${currentMenuItem.imagePublicId}`,
          );
          finalImagePublicId = null;
        } catch (error) {
          console.error("Error deleting image:", error);
          // Continue even if image deletion fails
        }
      }
    }

    // Update menu item
    const updatedItem = await db.menuItem.update({
      where: {
        id: params.menuId,
        foodcourtId: foodcourt.id,
      },
      data: {
        name,
        description,
        price: priceValue,
        image: finalImage,
        imagePublicId: finalImagePublicId,
        isAvailable,
        categoryId,
      },
    });

    console.log("Menu item updated successfully:", updatedItem);
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      {
        error: "Failed to update menu item",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// DELETE /api/foodcourt/[foodcourtId]/menu/[menuId] - Delete a menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { foodcourtId: string; menuId: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get foodcourt either from param or by owner ID
    let foodcourt = null;
    if (params.foodcourtId) {
      foodcourt = await db.foodcourt.findUnique({
        where: { id: params.foodcourtId },
      });
    }

    // If not found, check if the param is an owner ID
    if (!foodcourt) {
      foodcourt = await db.foodcourt.findFirst({
        where: { ownerId: params.foodcourtId },
      });
    }

    if (!foodcourt) {
      return NextResponse.json(
        { error: "Foodcourt not found" },
        { status: 404 },
      );
    }

    // Check if menu item exists and belongs to the foodcourt
    const menuItem = await db.menuItem.findFirst({
      where: {
        id: params.menuId,
        foodcourtId: foodcourt.id,
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Check permission
    const [userPermission, user] = await Promise.all([
      db.ownerPermission.findUnique({
        where: {
          ownerId_foodcourtId: {
            ownerId: session.user.id,
            foodcourtId: foodcourt.id,
          },
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      }),
    ]);

    const isAdmin = user?.role === "ADMIN";
    const isFoodcourtOwner = user?.role === "OWNER";
    const hasPermission =
      !!userPermission?.canEditMenu || foodcourt.ownerId === session.user.id;

    if (
      !hasPermission &&
      !isAdmin &&
      (!isFoodcourtOwner || foodcourt.ownerId !== session.user.id)
    ) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to delete menu items from this foodcourt",
        },
        { status: 403 },
      );
    }

    // Delete image from Cloudinary if it exists
    if (menuItem.imagePublicId) {
      try {
        await deleteImage(menuItem.imagePublicId);
        console.log(`Deleted menu item image: ${menuItem.imagePublicId}`);
      } catch (error) {
        console.error("Error deleting image:", error);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete the menu item
    await db.menuItem.delete({
      where: {
        id: params.menuId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      {
        error: "Failed to delete menu item",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

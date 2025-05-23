import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { uploadImage } from "~/lib/cloudinary-utils";

// GET /api/foodcourt/[foodcourtId]/menu - List menu items
export async function GET(
  request: NextRequest,
  { params }: { params: { foodcourtId: string } },
) {
  try {
    const session = await auth();

    if (!params.foodcourtId && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const available = searchParams.get("available");

    let foodcourt = null;

    // Try getting foodcourt from path param (could be foodcourt ID)
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

    // Build where clause
    const where: any = { foodcourtId: foodcourt.id };
    if (categoryId) where.categoryId = categoryId;
    if (available !== null) where.isAvailable = available === "true";

    const menuItems = await db.menuItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ menuItems }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch menu items",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// POST /api/foodcourt/[foodcourtId]/menu - Create a new menu item (Owner only)
export async function POST(
  request: NextRequest,
  { params }: { params: { foodcourtId: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let data;
    let imageFile;
    const contentType = request.headers.get("content-type") || "";

    // Handle different content types (JSON or multipart form data)
    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data with image file
      const formData = await request.formData();
      console.log("Received form data");

      data = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || "",
        price: parseFloat(formData.get("price") as string),
        isAvailable: formData.get("isAvailable") === "true",
        categoryId: (formData.get("categoryId") as string) || undefined,
      };

      imageFile = formData.get("image") as File;
      console.log("Extracted form data:", {
        ...data,
        hasImage: !!imageFile,
        imageFileName: imageFile?.name,
      });
    } else {
      // Handle JSON data
      data = await request.json();
    }

    const { name, description, price, isAvailable, categoryId } = data;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let priceValue: number =
      typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceValue)) {
      return NextResponse.json(
        { error: "Invalid price format" },
        { status: 400 },
      );
    }

    // Get foodcourt either from param or by owner ID
    let foodcourt = null;

    // Try getting foodcourt from path param (could be foodcourt ID)
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
            "You don't have permission to add menu items to this foodcourt",
        },
        { status: 403 },
      );
    }

    // Handle image upload if present
    let image = null;
    let imagePublicId = null;

    if (imageFile && imageFile.size > 0) {
      try {
        console.log("Processing image upload...");
        // Convert file to buffer for server-side upload
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await uploadImage(buffer, "menu-items");

        image = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
        console.log("Image uploaded successfully:", { image, imagePublicId });
      } catch (error) {
        console.error("Image upload failed:", error);
        // Continue without image if upload fails
      }
    }

    // Create new menu item
    const menuItem = await db.menuItem.create({
      data: {
        name,
        description: description || "",
        price: priceValue,
        image,
        imagePublicId,
        isAvailable: isAvailable ?? true,
        foodcourtId: foodcourt.id,
        categoryId: categoryId || null,
      },
    });

    console.log("Menu item created:", menuItem);
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Failed to add menu item:", error);
    return NextResponse.json(
      {
        error: "Failed to add menu item",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

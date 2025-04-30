import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { FoodcourtStatus } from "@prisma/client";
import { z } from "zod";

// Schema for validation
const foodcourtUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullish(),
  address: z.string().min(1).optional(),
  logo: z.string().nullish(),
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

    const body = await req.json();
    const validatedData = foodcourtUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 },
      );
    }

    const updatedFoodcourt = await db.foodcourt.update({
      where: { id: foodcourtId },
      data: validatedData.data,
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

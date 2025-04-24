import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole, Prisma } from "@prisma/client";

// GET: Fetch all foodcourts with pagination and search
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (session?.user?.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Create search filter if search parameter exists
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              address: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : {};

    // Fetch foodcourts with owner and creator information
    const foodcourts = await db.foodcourt.findMany({
      where: searchFilter,
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        foodcourtCategories: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const totalCount = await db.foodcourt.count({
      where: searchFilter,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      foodcourts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching foodcourts:", error);
    return NextResponse.json(
      { error: "Failed to fetch foodcourts" },
      { status: 500 },
    );
  }
}

// POST: Create a new foodcourt
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (session?.user?.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, description, address, logo, isActive, ownerId } = body;

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 },
      );
    }

    // If ownerId is provided, verify that owner exists and has correct role
    if (ownerId) {
      const owner = await db.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        return NextResponse.json({ error: "Owner not found" }, { status: 404 });
      }

      // If owner is not a FOODCOURT_OWNER, update their role
      if (owner.role !== UserRole.FOODCOURT_OWNER) {
        await db.user.update({
          where: { id: ownerId },
          data: { role: UserRole.FOODCOURT_OWNER },
        });
      }
    }

    // Create the foodcourt with creatorId which is required according to schema
    const foodcourt = await db.foodcourt.create({
      data: {
        name,
        description,
        address,
        logo,
        isActive: isActive ?? true,
        creatorId: session.user.id,
        // Only set ownerId if provided
        ...(ownerId && { ownerId }),
      },
    });

    // Create default permissions if owner is assigned
    if (ownerId) {
      await db.ownerPermission.create({
        data: {
          ownerId,
          foodcourtId: foodcourt.id,
          canEditMenu: true,
          canViewOrders: true,
          canUpdateOrders: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Foodcourt created successfully",
        foodcourt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating foodcourt:", error);
    return NextResponse.json(
      { error: "Failed to create foodcourt" },
      { status: 500 },
    );
  }
}

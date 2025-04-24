import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole, Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

// GET: Fetch all owners with pagination and search
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
    const searchFilter: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              username: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
          role: UserRole.FOODCOURT_OWNER,
        }
      : {
          role: UserRole.FOODCOURT_OWNER,
        };

    // Fetch owners with their assigned foodcourts - use the correct relation name
    const owners = await db.user.findMany({
      where: searchFilter,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        permissions: {
          select: {
            id: true,
            foodcourtId: true,
            canEditMenu: true,
            canViewOrders: true,
            canUpdateOrders: true,
            foodcourt: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const totalCount = await db.user.count({
      where: searchFilter,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      owners,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 },
    );
  }
}

// POST: Create a new owner
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
    const { name, email, username, password, image } = body;

    // Validate required fields
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: "Name, email, username, and password are required" },
        { status: 400 },
      );
    }

    // Check if email or username already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already in use" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new owner
    const owner = await db.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        image,
        role: UserRole.FOODCOURT_OWNER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        // Don't return the password
      },
    });

    return NextResponse.json(
      {
        message: "Owner created successfully",
        owner,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating owner:", error);
    return NextResponse.json(
      { error: "Failed to create owner" },
      { status: 500 },
    );
  }
}

// ~/src/app/(dashboard)/owner/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import {
  UserRole,
  OrderStatus,
  type User,
  type Order,
} from "~/lib/shared-types";
import { OwnerDashboard } from "~/components/dashboard/owner/owner-dashboard";

export default async function OwnerDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Redirect if not logged in or not an owner
  if (
    !session?.user ||
    (session.user.role !== UserRole.FOODCOURT_OWNER &&
      session.user.role !== UserRole.ADMIN)
  ) {
    redirect("/login");
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === UserRole.ADMIN;

  // If not admin, verify if the logged-in user is accessing their own dashboard
  if (!isAdmin && userId !== params.id) {
    return notFound();
  }

  // Get the owner's information and their foodcourt
  const owner = await db.user.findUnique({
    where: { id: params.id },
    include: {
      foodcourts: true,
    },
  });

  if (!owner) {
    return notFound();
  }

  // Transform the Prisma User to match our shared types
  const typedOwner: User = {
    id: owner.id,
    name: owner.name,
    email: owner.email,
    username: owner.username,
    image: owner.image,
    role: owner.role as unknown as UserRole,
    foodcourts: owner.foodcourts.map((fc) => ({
      id: fc.id,
      name: fc.name,
      address: fc.address,
      description: fc.description,
      logo: fc.logo,
      isActive: fc.isActive,
      createdAt: fc.createdAt,
      updatedAt: fc.updatedAt,
      ownerId: fc.ownerId,
    })),
  };

  // Get recent orders for the foodcourt
  const foodcourtId = owner.foodcourts[0]?.id;
  let recentOrders: Order[] = [];

  if (foodcourtId) {
    const dbOrders = await db.order.findMany({
      where: {
        orderItems: {
          some: {
            foodcourtId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

    // Transform DB orders to match our shared type
    recentOrders = dbOrders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      totalAmount: Number(order.totalAmount),
      // Convert Prisma enum to our shared type enum
      status: order.status as unknown as OrderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      tableId: order.tableId,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        specialInstructions: item.specialInstructions,
        // Convert Prisma enum to our shared type enum
        status: item.status as unknown as OrderStatus,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        orderId: item.orderId,
        foodcourtId: item.foodcourtId,
        menuItemId: item.menuItemId,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          price: Number(item.menuItem.price),
          imageUrl: item.menuItem.imageUrl,
          isAvailable: item.menuItem.isAvailable,
          foodcourtId: item.menuItem.foodcourtId,
          categoryId: item.menuItem.categoryId,
        },
      })),
      table: {
        id: order.table.id,
        tableNumber: order.table.tableNumber,
        capacity: order.table.capacity,
        qrCode: order.table.qrCode,
        isAvailable: order.table.isAvailable,
      },
    }));
  }

  // Get order statistics
  const totalOrders = foodcourtId
    ? await db.orderItem.count({
        where: {
          foodcourtId,
        },
      })
    : 0;

  const pendingOrders = foodcourtId
    ? await db.orderItem.count({
        where: {
          foodcourtId,
          status: "PENDING", // Using string literal to match Prisma's enum
        },
      })
    : 0;

  const preparingOrders = foodcourtId
    ? await db.orderItem.count({
        where: {
          foodcourtId,
          status: "PREPARING", // Using string literal to match Prisma's enum
        },
      })
    : 0;

  const readyOrders = foodcourtId
    ? await db.orderItem.count({
        where: {
          foodcourtId,
          status: "READY", // Using string literal to match Prisma's enum
        },
      })
    : 0;

  return (
    <OwnerDashboard
      owner={typedOwner}
      foodcourtId={foodcourtId}
      isAdmin={isAdmin}
      orderStats={{
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
      }}
      recentOrders={recentOrders}
    />
  );
}
// ~/src/app/(dashboard)/owner/[id]/page.tsx

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  UserRole,
  OrderStatus,
  type User,
  type Order,
  type OrderStats,
  type Foodcourt,
  type Table,
  type OrderItem,
  type MenuItem,
} from "~/lib/shared-types";
import { OwnerDashboard } from "~/components/dashboard/owner/owner-dashboard";

// This is a Server Component that fetches data
export default async function OwnerDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Check if viewing own profile or admin viewing owner's profile
  const isAdmin = session.user.role === UserRole.ADMIN;
  const isOwner = session.user.role === UserRole.FOODCOURT_OWNER;

  // If not admin and not the owner being viewed, redirect
  if (!isAdmin && isOwner && session.user.id !== params.id) {
    redirect("/login");
  }

  // Get owner data
  const ownerData = await db.user.findUnique({
    where: {
      id: params.id,
      role: "FOODCOURT_OWNER", // Use string literal instead of enum for Prisma
    },
    include: {
      ownedFoodcourts: true,
    },
  });

  if (!ownerData) {
    redirect("/404");
  }

  // Map the Prisma User to our shared User type
  const owner: User = {
    id: ownerData.id,
    name: ownerData.name,
    email: ownerData.email,
    username: ownerData.username,
    image: ownerData.image,
    role: UserRole.FOODCOURT_OWNER,
    foodcourts: ownerData.ownedFoodcourts.map(
      (fc): Foodcourt => ({
        id: fc.id,
        name: fc.name,
        description: fc.description,
        address: fc.address,
        logo: fc.logo,
        isActive: fc.isActive,
        createdAt: fc.createdAt,
        updatedAt: fc.updatedAt,
        ownerId: fc.ownerId ?? undefined,
      }),
    ),
  };

  // Get the foodcourt
  const foodcourt = ownerData.ownedFoodcourts[0];
  const foodcourtId = foodcourt?.id;

  // Get order stats if a foodcourt exists
  const orderStats: OrderStats = foodcourtId
    ? {
        // Count orders associated with this foodcourt through orderItems
        totalOrders: await db.order.count({
          where: {
            orderItems: {
              some: {
                foodcourtId: foodcourtId,
              },
            },
          },
        }),
        pendingOrders: await db.order.count({
          where: {
            orderItems: {
              some: {
                foodcourtId: foodcourtId,
              },
            },
            status: "PENDING",
          },
        }),
        preparingOrders: await db.order.count({
          where: {
            orderItems: {
              some: {
                foodcourtId: foodcourtId,
              },
            },
            status: "PREPARING",
          },
        }),
        readyOrders: await db.order.count({
          where: {
            orderItems: {
              some: {
                foodcourtId: foodcourtId,
              },
            },
            status: "READY",
          },
        }),
      }
    : {
        totalOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
      };

  // Get recent orders if a foodcourt exists
  const prismaOrders = foodcourtId
    ? await db.order.findMany({
        where: {
          orderItems: {
            some: {
              foodcourtId: foodcourtId,
            },
          },
        },
        include: {
          orderItems: {
            where: {
              foodcourtId: foodcourtId,
            },
            include: {
              menuItem: true,
            },
          },
          table: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  // Map Prisma orders to match the Order type exactly
  const recentOrders: Order[] = prismaOrders.map((order) => {
    // Map table to match the Table type
    const table: Table = {
      id: order.table.id,
      tableNumber: order.table.tableNumber,
      capacity: order.table.capacity,
      qrCode: order.table.qrCode,
      isAvailable: order.table.isAvailable,
    };

    // Map order items to match the OrderItem type
    const orderItems: OrderItem[] = order.orderItems.map((item) => {
      // Map menu item to match the MenuItem type
      const menuItem: MenuItem = {
        id: item.menuItem.id,
        name: item.menuItem.name,
        description: item.menuItem.description,
        price: Number(item.menuItem.price),
        imageUrl: item.menuItem.imageUrl,
        isAvailable: item.menuItem.isAvailable,
        foodcourtId: item.menuItem.foodcourtId,
        categoryId: item.menuItem.categoryId,
      };

      return {
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        specialInstructions: item.specialInstructions,
        status: item.status as OrderStatus,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        orderId: item.orderId,
        foodcourtId: item.foodcourtId,
        menuItemId: item.menuItemId,
        menuItem: menuItem,
      };
    });

    // Return the complete Order object
    return {
      id: order.id,
      customerName: order.customerName,
      totalAmount: Number(order.totalAmount),
      status: order.status as OrderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      tableId: order.tableId,
      orderItems: orderItems,
      table: table,
    };
  });

  // Render the OwnerDashboard component without wrapping it in DashboardLayout
  return (
    <OwnerDashboard
      owner={owner}
      foodcourtId={foodcourtId}
      isAdmin={isAdmin}
      orderStats={orderStats}
      recentOrders={recentOrders}
    />
  );
}
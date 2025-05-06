// ~\src\app\(dashboard)\admin\owners\page.tsx

import type { Metadata } from "next";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { OwnerTables } from "~/components/dashboard/admin/owners/owner-tables";

export const metadata: Metadata = {
  title: "Foodcourt Owners",
  description: "Manage foodcourt owners",
};

type FoodcourtOwner = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  emailVerified: Date | null;
  ownedFoodcourts: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
  permissions: {
    id: string;
    canEditMenu: boolean;
    canViewOrders: boolean;
    canUpdateOrders: boolean;
    foodcourtId: string;
  }[];
};

function OwnersTable({ owners }: { owners: FoodcourtOwner[] }) {
  return (
    <div className="mx-auto max-w-6xl">
      <OwnerTables owners={owners} />
    </div>
  );
}

export default async function OwnersPage() {
  const owners = (
    await db.user.findMany({
      where: {
        role: "OWNER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        emailVerified: true,
        ownedFoodcourt: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        permissions: {
          select: {
            id: true,
            canEditMenu: true,
            canViewOrders: true,
            canUpdateOrders: true,
            foodcourtId: true,
          },
        },
      },
    })
  ).map((owner) => ({
    ...owner,
    ownedFoodcourts: owner.ownedFoodcourt ? [owner.ownedFoodcourt] : [],
  }));

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pemilik Stand</h1>
          <p className="text-muted-foreground">
            Kelola semua pemilik stand di Sistem
          </p>
        </div>
        <Link href="/admin/owners/invite">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite New Owner
          </Button>
        </Link>
      </div>


      <div className="mx-auto max-w-6xl">
        <OwnersTable owners={owners} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { UserRole } from "@prisma/client";

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
    <div className="rounded-xl border bg-white p-4 shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Verified</TableHead>
            <TableHead>Foodcourts</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[80px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {owners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No owners found.
              </TableCell>
            </TableRow>
          ) : (
            owners.map((owner) => (
              <TableRow
                key={owner.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {owner.name || "Unnamed"}
                </TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell className="text-center">
                  {owner.emailVerified ? (
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {owner.ownedFoodcourts.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        No foodcourts
                      </span>
                    ) : (
                      owner.ownedFoodcourts.map((foodcourt) => (
                        <Badge
                          key={foodcourt.id}
                          variant={foodcourt.isActive ? "default" : "outline"}
                          className="w-fit"
                        >
                          {foodcourt.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {owner.permissions.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        No permissions
                      </span>
                    ) : (
                      owner.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center gap-1 text-xs"
                        >
                          {permission.canEditMenu && (
                            <Badge variant="secondary" className="text-xs">
                              Edit Menu
                            </Badge>
                          )}
                          {permission.canViewOrders && (
                            <Badge variant="secondary" className="text-xs">
                              View Orders
                            </Badge>
                          )}
                          {permission.canUpdateOrders && (
                            <Badge variant="secondary" className="text-xs">
                              Update Orders
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>{format(owner.createdAt, "dd MMMM yyyy")}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/owners/${owner.id}`}>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </Link>
                      <Link href={`/admin/owners/${owner.id}/edit`}>
                        <DropdownMenuItem>Edit Owner</DropdownMenuItem>
                      </Link>
                      <Link href={`/admin/owners/${owner.id}/permissions`}>
                        <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function OwnersPage() {
  const owners = (
    await db.user.findMany({
      where: {
        role: "FOODCOURT_OWNER",
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
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Foodcourt Owners
          </h1>
          <p className="text-muted-foreground">
            Manage all foodcourt owners in the system
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

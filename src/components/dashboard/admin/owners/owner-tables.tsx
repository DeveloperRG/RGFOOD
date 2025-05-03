// ~/components/dashboard/admin/owners/owner-tables.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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

export function OwnerTables({ owners }: { owners: FoodcourtOwner[] }) {
  const withFoodcourt = owners.filter((o) => o.ownedFoodcourts.length > 0);
  const withoutFoodcourt = owners.filter((o) => o.ownedFoodcourts.length === 0);

  return (
    <div className="space-y-12">
      <OwnerTable title="Pemilik yang memiliki Stand" owners={withFoodcourt} />
      <OwnerTable
        title="Pemilik yang tidak memiliki Stand"
        owners={withoutFoodcourt}
        limitActions
      />
    </div>
  );
}

function OwnerTable({
  title,
  owners,
  limitActions = false,
}: {
  title: string;
  owners: FoodcourtOwner[];
  limitActions?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
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
                    {owner.ownedFoodcourts.map((foodcourt) => (
                      <Badge
                        key={foodcourt.id}
                        variant={foodcourt.isActive ? "default" : "outline"}
                        className="w-fit"
                      >
                        {foodcourt.name}
                      </Badge>
                    ))}
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
                      {!limitActions && (
                        <Link href={`/admin/owners/${owner.id}/permissions`}>
                          <DropdownMenuItem>
                            Manage Permissions
                          </DropdownMenuItem>
                        </Link>
                      )}
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

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

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
};

export function OwnerTables({ owners }: { owners: FoodcourtOwner[] }) {
  const withFoodcourt = owners.filter((o) => o.ownedFoodcourts.length > 0);
  const withoutFoodcourt = owners.filter((o) => o.ownedFoodcourts.length === 0);

  return (
    <Tabs defaultValue="with" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="with">Pemilik dengan Stand</TabsTrigger>
        <TabsTrigger value="without">Pemilik tanpa Stand</TabsTrigger>
      </TabsList>

      <TabsContent value="with">
        <OwnerTable
          title="Pemilik yang memiliki Stand"
          owners={withFoodcourt}
          columnsToShow={["number", "name", "foodcourts", "actions"]}
        />
      </TabsContent>

      <TabsContent value="without">
        <OwnerTable
          title="Pemilik yang tidak memiliki Stand"
          owners={withoutFoodcourt}
          columnsToShow={["number", "name", "foodcourts", "actions"]}
          limitActions
          noFoodcourtPlaceholder
        />
      </TabsContent>
    </Tabs>
  );
}

function OwnerTable({
  title,
  owners,
  columnsToShow,
  limitActions = false,
  noFoodcourtPlaceholder = false,
}: {
  title: string;
  owners: FoodcourtOwner[];
  columnsToShow: string[];
  limitActions?: boolean;
  noFoodcourtPlaceholder?: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-white px-6 py-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        {title}
        <span className="rounded-md bg-purple-100 px-2 py-0.5 text-sm font-medium text-purple-800 ring-1 ring-purple-300 ring-inset">
          {owners.length}
        </span>
      </h2>

      <Table className="w-full flex-grow text-sm">
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columnsToShow.includes("number") && (
              <TableHead className="text-center">No</TableHead>
            )}
            {columnsToShow.includes("name") && (
              <TableHead className="text-center">Name</TableHead>
            )}
            {columnsToShow.includes("foodcourts") && (
              <TableHead className="text-center">Foodcourts</TableHead>
            )}
            {columnsToShow.includes("actions") && (
              <TableHead className="text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {owners.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columnsToShow.length}
                className="h-20 text-center text-gray-500"
              >
                No owners found.
              </TableCell>
            </TableRow>
          ) : (
            owners.map((owner, index) => (
              <TableRow
                key={owner.id}
                className="transition-colors hover:bg-gray-50"
              >
                {columnsToShow.includes("number") && (
                  <TableCell className="py-3 text-center align-middle">
                    {index + 1}
                  </TableCell>
                )}
                {columnsToShow.includes("name") && (
                  <TableCell className="py-3 text-center align-middle font-medium text-gray-800">
                    {owner.name || "Unnamed"}
                  </TableCell>
                )}
                {columnsToShow.includes("foodcourts") && (
                  <TableCell className="py-3 text-center">
                    {owner.ownedFoodcourts.length > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        {owner.ownedFoodcourts.map((fc) => (
                          <Badge
                            key={fc.id}
                            className={`w-fit ${
                              fc.isActive
                                ? "border-green-200 bg-green-100 text-green-700"
                                : "border-red-200 bg-red-100 text-red-700"
                            }`}
                          >
                            {fc.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      noFoodcourtPlaceholder && (
                        <span className="text-red-500">-</span>
                      )
                    )}
                  </TableCell>
                )}
                {columnsToShow.includes("actions") && (
                  <TableCell className="py-3 text-center align-middle">
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
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

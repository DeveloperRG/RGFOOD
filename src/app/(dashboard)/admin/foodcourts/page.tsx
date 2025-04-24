// ~/src/app/(dashboard)/admin/foodcourts/page.tsx

import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { db } from "~/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Foodcourts Management",
  description: "Manage all foodcourts in the system",
};

export default async function FoodcourtsPage() {
  // Fetch all foodcourts with their owners
  const foodcourts = await db.foodcourt.findMany({
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foodcourts</h1>
          <p className="text-muted-foreground">
            Manage all foodcourts in the system
          </p>
        </div>
        <Link href="/admin/foodcourts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Foodcourt
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {foodcourts.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-muted-foreground">No foodcourts found</p>
          </div>
        ) : (
          foodcourts.map((foodcourt) => (
            <Card key={foodcourt.id} className="overflow-hidden">
              <div className="relative h-40 w-full">
                {foodcourt.logo ? (
                  <Image
                    src={foodcourt.logo}
                    alt={foodcourt.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <span className="text-muted-foreground">No logo</span>
                  </div>
                )}
              </div>

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{foodcourt.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/admin/foodcourts/${foodcourt.id}`}>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {foodcourt.description || "No description provided"}
                  </p>
                  <p className="text-sm">
                    <strong>Address:</strong> {foodcourt.address}
                  </p>
                  <p className="text-sm">
                    <strong>Owner:</strong>{" "}
                    {foodcourt.owner?.name || "No owner assigned"}
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-medium ${foodcourt.isActive ? "text-green-600" : "text-red-600"}`}
                    >
                      {foodcourt.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

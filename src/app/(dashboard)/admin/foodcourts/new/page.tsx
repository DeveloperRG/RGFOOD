// ~/src/app/(dashboard)/admin/foodcourts/new/page.tsx

// ~/src/app/(dashboard)/admin/foodcourts/new/page.tsx

import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const metadata: Metadata = {
  title: "Add New Foodcourt",
  description: "Add a new foodcourt to the system",
};

export default async function NewFoodcourtPage() {
  const session = await auth();

  // Redirect if not logged in or not an admin
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  // Fetch all users with FOODCOURT_OWNER role who don't already have a foodcourt
  const potentialOwners = await db.user.findMany({
    where: {
      role: UserRole.FOODCOURT_OWNER,
      // Find users who don't have any foodcourts where they are the owner
      NOT: {
        ownedFoodcourt: {
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  async function createFoodcourt(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const address = formData.get("address") as string;
    const ownerId = (formData.get("ownerId") as string) || null;
    const isActive = formData.get("isActive") === "on";

    // Get current user for creator reference
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Create the foodcourt
    await db.foodcourt.create({
      data: {
        name,
        description,
        address,
        isActive,
        ownerId: ownerId || null,
        creatorId: session.user.id,
      },
    });

    // Redirect back to foodcourts list
    revalidatePath("/admin/foodcourts");
    redirect("/admin/foodcourts");
  }

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Link href="/admin/foodcourts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourts
          </Button>
        </Link>
      </div>

      <div className="mb-">
        <h1 className="text-3xl font-bold tracking-tight">Add New Foodcourt</h1>
        <p className="text-muted-foreground">
          Create a new foodcourt in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foodcourt Information</CardTitle>
          <CardDescription>
            Enter the details for the new foodcourt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createFoodcourt} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter foodcourt name"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="ownerId">Owner</Label>
                <select
                  id="ownerId"
                  name="ownerId"
                  className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <option value="">Select an owner</option>
                  {potentialOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name || "Unnamed"} ({owner.email || "No email"})
                    </option>
                  ))}
                </select>
                {potentialOwners.length === 0 && (
                  <p className="text-yellow-600 text-sm">
                    No available owners found. All foodcourt owners already have a foodcourt assigned.
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  Select a foodcourt owner from the list of available owners
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="isActive" name="isActive" defaultChecked />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div>
                <Button type="submit" className="w-full md:w-auto">
                  Create Foodcourt
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
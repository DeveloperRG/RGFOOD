// ~/src/app/(dashboard)/admin/foodcourts/[id]/edit/page.tsx

import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "~/server/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
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

export const metadata: Metadata = {
  title: "Edit Foodcourt",
  description: "Edit foodcourt details",
};

interface EditFoodcourtPageProps {
  params: {
    foodcourtsId: string; // Note: Parameter name matches file structure
  };
}

export default async function EditFoodcourtPage({
  params,
}: EditFoodcourtPageProps) {
  const { foodcourtsId } = params;

  const session = await auth();

  // Redirect if not logged in or not an admin
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  // Fetch foodcourt data
  const foodcourt = await db.foodcourt.findUnique({
    where: { id: foodcourtsId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!foodcourt) {
    notFound();
  }

  // Fetch all users with FOODCOURT_OWNER role for the owner selection dropdown
  const potentialOwners = await db.user.findMany({
    where: {
      role: UserRole.FOODCOURT_OWNER,
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

  async function updateFoodcourt(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const address = formData.get("address") as string;
    const ownerId = (formData.get("ownerId") as string) || null;
    const isActive = formData.get("isActive") === "on";

    // Update the foodcourt
    await db.foodcourt.update({
      where: { id: foodcourtsId },
      data: {
        name,
        description,
        address,
        isActive,
        ownerId: ownerId || null,
      },
    });

    // Redirect back to foodcourt details
    revalidatePath(`/admin/foodcourts/${foodcourtsId}`);
    redirect(`/admin/foodcourts/${foodcourtsId}`);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/foodcourts/${foodcourtsId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourt Details
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Foodcourt</h1>
        <p className="text-muted-foreground">Update foodcourt information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foodcourt Information</CardTitle>
          <CardDescription>
            Update the details for this foodcourt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateFoodcourt} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={foodcourt.name}
                  placeholder="Enter foodcourt name"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={foodcourt.description || ""}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={foodcourt.address}
                  placeholder="Enter address"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="ownerId">Owner</Label>
                <select
                  id="ownerId"
                  name="ownerId"
                  defaultValue={foodcourt.ownerId || ""}
                  className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <option value="">Select an owner</option>
                  {potentialOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name || "Unnamed"} ({owner.email || "No email"})
                    </option>
                  ))}
                </select>
                <p className="text-muted-foreground text-sm">
                  Select a foodcourt owner from the list
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  name="isActive"
                  defaultChecked={foodcourt.isActive}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit">Update Foodcourt</Button>
                <Link href={`/admin/foodcourts/${foodcourtsId}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

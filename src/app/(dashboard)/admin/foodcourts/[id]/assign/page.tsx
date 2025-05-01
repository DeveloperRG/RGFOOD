// ~/src/app/(dashboard)/admin/foodcourts/[id]/assign/page.tsx

import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "~/server/db";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UserRole } from "~/lib/shared-types";

export const metadata: Metadata = {
  title: "Assign Owner",
  description: "Assign an owner to this foodcourt",
};

interface AssignOwnerPageProps {
  params: {
    foodcourtsId: string;
  };
}

export default async function AssignOwnerPage({ params }: AssignOwnerPageProps) {
  const { foodcourtsId: id } = params;

  const foodcourt = await db.foodcourt.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!foodcourt) notFound();

  const isSystemUser = foodcourt.owner?.email === "system@foodcourt.internal";
  const hasRealOwner = !!foodcourt.owner && !isSystemUser;

  if (hasRealOwner) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href={`/admin/foodcourts/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Foodcourt Details
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-2 text-xl font-bold text-yellow-800">
            Owner Already Assigned
          </h2>
          <p className="text-yellow-800">
            This foodcourt already has an owner assigned (
            {foodcourt.owner?.name || foodcourt.owner?.email}). To change the
            owner, you need to unassign the current owner first.
          </p>
          <div className="mt-4">
            <Link href={`/admin/foodcourts/${id}`}>
              <Button variant="outline">Back to Foodcourt Details</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const users = await db.user.findMany({
    where: { role: UserRole.OWNER },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/foodcourts/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourt Details
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assign Owner</h1>
        <p className="text-muted-foreground">Assign an owner to {foodcourt.name}</p>
      </div>

      <AssignOwnerForm foodcourtId={id} users={users} />
    </div>
  );
}

// Inline AssignOwnerForm Component
function AssignOwnerForm({
  foodcourtId,
  users,
}: {
  foodcourtId: string;
  users: { id: string; name: string | null; email: string | null }[];
}) {
  async function handleAssignOwner(formData: FormData) {
    "use server";

    const ownerId = formData.get("ownerId") as string;

    if (!ownerId) {
      throw new Error("Owner ID is required");
    }

    await db.foodcourt.update({
      where: { id: foodcourtId },
      data: { ownerId },
    });

    // Optionally create permissions
    await db.ownerPermission.create({
      data: {
        foodcourtId,
        ownerId,
      },
    });

    revalidatePath(`/admin/foodcourts/${foodcourtId}`);
    redirect(`/admin/foodcourts/${foodcourtId}`);
  }

  return (
    <form action={handleAssignOwner} className="space-y-4">
      <div>
        <label htmlFor="ownerId" className="block text-sm font-medium mb-1">
          Select Owner
        </label>
        <select
          name="ownerId"
          id="ownerId"
          className="w-full rounded-md border p-2"
          required
        >
          <option value="">-- Choose Owner --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit">Assign Owner</Button>
    </form>
  );
}

import { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditPermissionsForm } from "~/components/owners/edit-permissions-form";

export const metadata: Metadata = {
    title: "Edit Owner Permissions",
    description: "Edit foodcourt owner permissions",
};

interface EditPermissionsPageProps {
    params: {
        id: string;
    };
}

export default async function EditPermissionsPage({ params }: EditPermissionsPageProps) {
    const { id } = params;

    // Fetch owner with foodcourt and permissions
    const owner = await db.user.findUnique({
        where: { id },
        include: {
            ownedFoodcourts: true, // Changed from foodcourts to ownedFoodcourts
            permissions: true,
        },
    });

    if (!owner || owner.role !== "OWNER") {
        notFound();
    }

    if (owner.ownedFoodcourts.length === 0) { // Changed from foodcourts to ownedFoodcourts
        // Redirect or show error if owner has no foodcourt
        return (
            <div className="container mx-auto py-8">
                <div className="mb-6">
                    <Link href={`/admin/owners/${id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Owner Details
                        </Button>
                    </Link>
                </div>

                <div className="bg-destructive/10 p-6 rounded-lg border border-destructive">
                    <h2 className="text-xl font-bold text-destructive mb-2">
                        No Foodcourt Assigned
                    </h2>
                    <p>
                        This owner does not have a foodcourt assigned yet.
                        Assign a foodcourt first before managing permissions.
                    </p>
                    <div className="mt-4">
                        <Link href={`/admin/owners/${id}`}>
                            <Button variant="outline">Back to Owner Details</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const foodcourt = owner.ownedFoodcourts[0]; // Changed from foodcourts to ownedFoodcourts
    const permission = owner.permissions.find(p => p.foodcourtId === foodcourt.id) || null;

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href={`/admin/owners/${id}`}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Owner Details
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Edit Permissions
                </h1>
                <p className="text-muted-foreground">
                    Manage permissions for {owner.name || "Owner"} on {foodcourt.name}
                </p>
            </div>

            <EditPermissionsForm
                ownerId={id}
                foodcourtId={foodcourt.id}
                foodcourtName={foodcourt.name}
                initialPermissions={permission}
            />
        </div>
    );
}
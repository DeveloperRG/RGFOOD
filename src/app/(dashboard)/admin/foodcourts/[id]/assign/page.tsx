import { Metadata } from "next";
import { AssignOwnerForm } from "~/components/foodcourts/assign-owner-form";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "~/server/db";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Assign Owner",
    description: "Assign an owner to this foodcourt",
};

interface AssignOwnerPageProps {
    params: {
        id: string;
    };
}

export default async function AssignOwnerPage({
                                                  params
                                              }: AssignOwnerPageProps) {
    const { id } = params;

    // Fetch foodcourt data
    const foodcourt = await db.foodcourt.findUnique({
        where: { id },
        include: {
            owner: true,
        },
    });

    if (!foodcourt) {
        notFound();
    }

    // Check if foodcourt already has a real owner
    const isSystemUser = foodcourt.owner?.email === "system@foodcourt.internal";
    const hasRealOwner = !!foodcourt.owner && !isSystemUser;

    // If already has real owner, redirect to foodcourt details
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

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">
                        Owner Already Assigned
                    </h2>
                    <p className="text-yellow-800">
                        This foodcourt already has an owner assigned ({foodcourt.owner?.name || foodcourt.owner?.email}).
                        To change the owner, you need to unassign the current owner first.
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
                <p className="text-muted-foreground">
                    Assign an owner to {foodcourt.name}
                </p>
            </div>

            <AssignOwnerForm
                foodcourtId={id}
                currentOwnerId={isSystemUser ? null : foodcourt.owner?.id}
            />
        </div>
    );
}
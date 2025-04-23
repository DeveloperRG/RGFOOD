import { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, UserPlus } from "lucide-react";
import { FoodcourtDetails } from "~/components/foodcourts/foodcourt-details";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
    title: "Foodcourt Details",
    description: "View foodcourt details and manage owner",
};

interface FoodcourtDetailsPageProps {
    params: {
        id: string;
    };
}

export default async function FoodcourtDetailsPage({
                                                       params,
                                                   }: FoodcourtDetailsPageProps) {
    const { id } = params;


    // Fetch foodcourt with owner and creator data
    const foodcourt = await db.foodcourt.findUnique({
        where: { id },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            creator: { // Add creator data
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            ownerPermissions: true,
        },
    });

    if (!foodcourt) {
        notFound();
    }

    // Check if foodcourt has a real owner (not system user)
    const hasRealOwner = !!foodcourt.owner && foodcourt.owner.email !== "system@foodcourt.internal";

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href="/admin/foodcourts">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Foodcourts
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {foodcourt.name}
                    </h1>
                    <div className="flex items-center mt-2 gap-2">
                        <Badge variant={foodcourt.isActive ? "success" : "destructive"}>
                            {foodcourt.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {hasRealOwner && (
                            <Badge variant="outline">Owned by {foodcourt.owner.name || foodcourt.owner.email}</Badge>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/foodcourts/${id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Foodcourt
                        </Button>
                    </Link>
                    {!hasRealOwner && (
                        <Link href={`/admin/foodcourts/${id}/assign`}>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign Owner
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <FoodcourtDetails foodcourt={foodcourt} />
        </div>
    );
}
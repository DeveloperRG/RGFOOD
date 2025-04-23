// noinspection TypeScriptValidateTypes

import { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { OwnerFoodcourtCard } from "~/components/owners/owner-foodcourt-card";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

export const metadata: Metadata = {
    title: "Owner Details",
    description: "View foodcourt owner details",
};

interface OwnerDetailsPageProps {
    params: {
        id: string;
    };
}

export default async function OwnerDetailsPage({ params }: OwnerDetailsPageProps) {
    const { id } = params;

    // Fetch owner with foodcourt data
    const owner = await db.user.findUnique({
        where: { id },
        include: {
            ownedFoodcourts: { // Changed from foodcourts to ownedFoodcourts
                select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                    isActive: true,
                    logo: true,
                    _count: {
                        select: {
                            menuItems: true,
                        },
                    },
                },
            },
            permissions: true,
        },
    });

    if (!owner || owner.role !== "FOODCOURT_OWNER") {
        notFound();
    }

    const hasAssignedFoodcourt = owner.ownedFoodcourts.length > 0; // Changed from foodcourts to ownedFoodcourts

    // Get active orders count separately if needed
    const foodcourtIds = owner.ownedFoodcourts.map(fc => fc.id); // Changed from foodcourts to ownedFoodcourts
    const activeOrdersCount = foodcourtIds.length > 0
        ? await db.orderItem.count({
            where: {
                foodcourtId: { in: foodcourtIds },
                order: {
                    status: {
                        in: ["PENDING", "PREPARING", "READY"],
                    },
                },
            },
        })
        : 0;

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href="/admin/owners">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Owners
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {owner.name || "Owner"}
                    </h1>
                    <p className="text-muted-foreground">{owner.email}</p>
                    <div className="flex items-center mt-2 gap-2">
                        <Badge variant="outline">Foodcourt Owner</Badge>
                        <Badge
                            variant={owner.emailVerified ? "success" : "destructive"}
                        >
                            {owner.emailVerified ? "Verified" : "Not Verified"}
                        </Badge>
                    </div>
                </div>
                {!hasAssignedFoodcourt && (
                    <Link href={`/admin/owners/${id}/assign`}>
                        <Button>
                            <Store className="mr-2 h-4 w-4" />
                            Assign Foodcourt
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Owner Information</CardTitle>
                        <CardDescription>Account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                            <p>{owner.name || "—"}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                            <p>{owner.email}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Account Created
                            </h3>
                            <p>{format(new Date(owner.createdAt), "PPP")}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Email Verification
                            </h3>
                            {owner.emailVerified ? (
                                <p>Verified on {format(new Date(owner.emailVerified), "PPP")}</p>
                            ) : (
                                <p className="text-destructive">Not verified</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Foodcourt</CardTitle>
                            <CardDescription>
                                Foodcourt managed by this owner
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasAssignedFoodcourt ? (
                                <div className="space-y-4">
                                    {owner.ownedFoodcourts.map((foodcourt) => ( // Changed from foodcourts to ownedFoodcourts
                                        <OwnerFoodcourtCard
                                            key={foodcourt.id}
                                            foodcourt={foodcourt}
                                            permission={owner.permissions.find(
                                                (p) => p.foodcourtId === foodcourt.id
                                            )}
                                            activeOrdersCount={activeOrdersCount}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">
                                        No foodcourt assigned to this owner yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
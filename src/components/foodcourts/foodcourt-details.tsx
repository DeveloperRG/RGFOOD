// noinspection TypeScriptValidateTypes

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { UserPlus } from "lucide-react";

type FoodcourtDetailsProps = {
    foodcourt: {
        id: string;
        name: string;
        description: string | null;
        address: string;
        logo: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        owner: {
            id: string;
            name: string | null;
            email: string | null;
            role: string;
        } | null;
        creator: {
            id: string;
            name: string | null;
            email: string | null;
            role: string;
        };
        ownerPermissions: Array<{
            id: string;
            canEditMenu: boolean;
            canViewOrders: boolean;
            canUpdateOrders: boolean;
        }>;
    };
};

export function FoodcourtDetails({ foodcourt }: FoodcourtDetailsProps) {
    const ownerPermission = foodcourt.owner && foodcourt.ownerPermissions.length > 0
        ? foodcourt.ownerPermissions[0]
        : null;

    const isSystemUser = foodcourt.owner?.email === "system@foodcourt.internal";

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Foodcourt Information</CardTitle>
                    <CardDescription>Basic details about the foodcourt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p>{foodcourt.name}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Description
                        </h3>
                        <p>{foodcourt.description || "No description provided"}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Address
                        </h3>
                        <p>{foodcourt.address}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Status
                        </h3>
                        <Badge variant={foodcourt.isActive ? "success" : "destructive"}>
                            {foodcourt.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>

                    {foodcourt.logo && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Logo
                            </h3>
                            <div className="mt-2 max-w-[200px]">
                                <img
                                    src={foodcourt.logo}
                                    alt={`${foodcourt.name} logo`}
                                    className="rounded-md border"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Created By
                        </h3>
                        <p>{foodcourt.creator.name || foodcourt.creator.email}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Created At
                        </h3>
                        <p>{format(new Date(foodcourt.createdAt), "PPP")}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Last Updated
                        </h3>
                        <p>{format(new Date(foodcourt.updatedAt), "PPP")}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Owner Information</CardTitle>
                    <CardDescription>
                        Details about the foodcourt owner
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {foodcourt.owner && !isSystemUser ? (
                        <>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Owner Name
                                </h3>
                                <p>{foodcourt.owner.name || "—"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Email
                                </h3>
                                <p>{foodcourt.owner.email}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Role
                                </h3>
                                <Badge variant="outline">{foodcourt.owner.role}</Badge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Permissions
                                </h3>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center">
                                        <span className="w-32">Edit Menu:</span>
                                        <Badge variant={ownerPermission?.canEditMenu ? "success" : "destructive"}>
                                            {ownerPermission?.canEditMenu ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32">View Orders:</span>
                                        <Badge variant={ownerPermission?.canViewOrders ? "success" : "destructive"}>
                                            {ownerPermission?.canViewOrders ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-32">Update Orders:</span>
                                        <Badge variant={ownerPermission?.canUpdateOrders ? "success" : "destructive"}>
                                            {ownerPermission?.canUpdateOrders ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Link href={`/admin/owners/${foodcourt.owner.id}`}>
                                    <Button variant="outline" size="sm">
                                        View Owner Details
                                    </Button>
                                </Link>
                                <Link href={`/admin/owners/${foodcourt.owner.id}/permissions`}>
                                    <Button variant="outline" size="sm">
                                        Edit Permissions
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                                No owner assigned to this foodcourt yet.
                            </p>
                            <div className="mt-4">
                                <Link href={`/admin/foodcourts/${foodcourt.id}/assign`}>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Assign Owner
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Creator Information</h3>
                        {foodcourt.creator ? (
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Name:</span>{" "}
                                    <span>{foodcourt.creator.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Email:</span>{" "}
                                    <span>{foodcourt.creator.email || "—"}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Creator information not available</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Store, ShoppingBag, Utensils } from "lucide-react";

type Foodcourt = {
    id: string;
    name: string;
    description: string | null;
    address: string;
    isActive: boolean;
    logo: string | null;
    _count: {
        menuItems: number;
    };
};

type Permission = {
    id: string;
    canEditMenu: boolean;
    canViewOrders: boolean;
    canUpdateOrders: boolean;
    foodcourtId: string;
} | undefined;

interface OwnerFoodcourtCardProps {
    foodcourt: Foodcourt;
    permission: Permission;
    activeOrdersCount: number;
}

export function OwnerFoodcourtCard({
                                       foodcourt,
                                       permission,
                                       activeOrdersCount
                                   }: OwnerFoodcourtCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle>{foodcourt.name}</CardTitle>
                    <Badge variant={foodcourt.isActive ? "success" : "destructive"}>
                        {foodcourt.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
                <CardDescription>{foodcourt.address}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="flex flex-col items-center justify-center border rounded-lg p-2">
                        <Utensils className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="text-lg font-medium">{foodcourt._count.menuItems}</span>
                        <span className="text-xs text-muted-foreground">Menu Items</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border rounded-lg p-2">
                        <ShoppingBag className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="text-lg font-medium">{activeOrdersCount}</span>
                        <span className="text-xs text-muted-foreground">Active Orders</span>
                    </div>
                </div>

                {permission && (
                    <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Permissions</h4>
                            <Link href={`/admin/owners/${permission.foodcourtId}/permissions`}>
                                <Button variant="outline" size="sm">Edit Permissions</Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <Badge variant={permission.canEditMenu ? "success" : "destructive"} className="w-full">
                                    {permission.canEditMenu ? "Can Edit Menu" : "Can't Edit Menu"}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <Badge variant={permission.canViewOrders ? "success" : "destructive"} className="w-full">
                                    {permission.canViewOrders ? "Can View Orders" : "Can't View Orders"}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <Badge variant={permission.canUpdateOrders ? "success" : "destructive"} className="w-full">
                                    {permission.canUpdateOrders ? "Can Update Orders" : "Can't Update Orders"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Link href={`/admin/foodcourts/${foodcourt.id}`} className="w-full">
                    <Button variant="outline" className="w-full">View Foodcourt Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
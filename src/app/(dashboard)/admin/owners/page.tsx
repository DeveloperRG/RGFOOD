// noinspection TypeScriptValidateTypes

import { Metadata } from "next";
import { db } from "~/server/db";
import { OwnersTable } from "~/components/owners/owners-table";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Foodcourt Owners",
    description: "Manage foodcourt owners",
};

export default async function OwnersPage() {
    // Fetch all users with FOODCOURT_OWNER role, including their foodcourts
    const owners = await db.user.findMany({
        where: {
            role: "FOODCOURT_OWNER",
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            emailVerified: true,
            ownedFoodcourts: { // Changed from foodcourts to ownedFoodcourts
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                },
            },
            permissions: {
                select: {
                    id: true,
                    canEditMenu: true,
                    canViewOrders: true,
                    canUpdateOrders: true,
                    foodcourtId: true,
                },
            },
        },
    });

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Foodcourt Owners</h1>
                    <p className="text-muted-foreground">
                        Manage all foodcourt owners in the system
                    </p>
                </div>
                <Link href="/admin/owners/invite">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Invite New Owner
                    </Button>
                </Link>
            </div>

            <OwnersTable owners={owners} />
        </div>
    );
}
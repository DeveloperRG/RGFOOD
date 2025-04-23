import { Metadata } from "next";
import { FoodcourtList } from "~/components/foodcourts/foodcourt-list";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Foodcourts Management",
    description: "Manage all foodcourts in the system",
};

export default async function FoodcourtsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Foodcourts</h1>
                    <p className="text-muted-foreground">
                        Manage all foodcourts in the system
                    </p>
                </div>
                <Link href="/admin/foodcourts/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Foodcourt
                    </Button>
                </Link>
            </div>

            <FoodcourtList />
        </div>
    );
}
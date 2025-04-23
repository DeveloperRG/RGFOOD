import { Metadata } from "next";
import { FoodcourtForm } from "~/components/foodcourts/foodcourt-form";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Add New Foodcourt",
    description: "Add a new foodcourt to the system",
};

export default function NewFoodcourtPage() {
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

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Add New Foodcourt</h1>
                <p className="text-muted-foreground">
                    Create a new foodcourt in the system
                </p>
            </div>

            <FoodcourtForm />
        </div>
    );
}
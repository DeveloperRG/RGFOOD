import { Metadata } from "next";
import { FoodcourtForm } from "~/components/foodcourts/foodcourt-form";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "~/server/db";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Edit Foodcourt",
    description: "Edit foodcourt details",
};

interface EditFoodcourtPageProps {
    params: {
        id: string;
    };
}

export default async function EditFoodcourtPage({
                                                    params
                                                }: EditFoodcourtPageProps) {
    const { id } = params;

    // Fetch foodcourt data
    const foodcourt = await db.foodcourt.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            address: true,
            logo: true,
            isActive: true,
        },
    });

    if (!foodcourt) {
        notFound();
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
                <h1 className="text-3xl font-bold tracking-tight">Edit Foodcourt</h1>
                <p className="text-muted-foreground">
                    Update foodcourt information
                </p>
            </div>

            <FoodcourtForm foodcourt={foodcourt} />
        </div>
    );
}
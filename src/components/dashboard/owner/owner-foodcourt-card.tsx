// ~/components/dashboard/owner/owner-foodcourt-card.tsx

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";

interface Foodcourt {
  id: string;
  name: string;
  description?: string | null;
  address: string; // Changed from location to address per schema
  isActive?: boolean;
  logo?: string | null; // Added per schema
}

interface OwnerFoodcourtCardProps {
  foodcourt: Foodcourt;
}

export default function OwnerFoodcourtCard({
  foodcourt,
}: OwnerFoodcourtCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{foodcourt.name}</CardTitle>
            <CardDescription>Foodcourt Information</CardDescription>
          </div>
          {foodcourt.isActive !== undefined && (
            <Badge variant={foodcourt.isActive ? "default" : "destructive"}>
              {foodcourt.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {foodcourt.description && (
          <p className="text-muted-foreground text-sm">
            {foodcourt.description}
          </p>
        )}

        <div className="space-y-2">
          {foodcourt.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span>{foodcourt.address}</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Link
            href={`/foodcourt/${foodcourt.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View Public Page
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
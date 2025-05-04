// ~/components/dashboard/admin/owners/owner-foodcourt-card.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface OwnerFoodcourtCardProps {
  foodcourt: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    isActive: boolean;

    _count: {
      menuItems: number;
    };
  };
  permission?: {
    role: string;
    foodcourtId: string;
  };
  activeOrdersCount: number;
}

export function OwnerFoodcourtCard({
  foodcourt,
  permission,
  activeOrdersCount,
}: OwnerFoodcourtCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{foodcourt.name}</span>
          <Badge className={
    foodcourt.isActive
      ? "border-green-150 bg-green-100 text-green-700"
      : "border-red-150 bg-red-100 text-red-700"
  }
 variant={foodcourt.isActive ? "default" : "destructive"}>
            {foodcourt.isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{foodcourt.description}</p>

        <div className="space-y-1 text-sm">
          <p>
            <strong>Address:</strong> {foodcourt.address}
          </p>
          <p>
            <strong>Menu Items:</strong> {foodcourt._count.menuItems}
          </p>
          <p>
        
          </p>
          {permission && (
            <p>
              <strong>Owner Role:</strong>{" "}
              <Badge variant="outline">{permission.role}</Badge>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

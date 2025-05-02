"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PermissionToggle } from "./permission-toggle";
import { toast } from "sonner";
import { Shield, Save, Loader2 } from "lucide-react";

interface OwnerPermission {
  id: string;
  ownerId: string;
  foodcourtId: string;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
  foodcourt?: {
    id: string;
    name: string;
  };
}

interface PermissionFormProps {
  ownerId: string;
  foodcourtId?: string;
  initialPermissions?: OwnerPermission | null;
  onSaved?: () => void;
  isDefault?: boolean;
}

export function PermissionForm({
  ownerId,
  foodcourtId,
  initialPermissions,
  onSaved,
  isDefault = false,
}: PermissionFormProps) {
  const [permissions, setPermissions] = useState({
    canEditMenu: true,
    canViewOrders: true,
    canUpdateOrders: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial permissions if provided or fetch from API
  useEffect(() => {
    if (initialPermissions) {
      setPermissions({
        canEditMenu: initialPermissions.canEditMenu,
        canViewOrders: initialPermissions.canViewOrders,
        canUpdateOrders: initialPermissions.canUpdateOrders,
      });
    } else if (ownerId && !isDefault) {
      fetchOwnerPermissions();
    } else if (isDefault) {
      fetchDefaultPermissions();
    }
  }, [ownerId, initialPermissions, isDefault]);

  const fetchOwnerPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/owners/${ownerId}/permissions`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
      
      const data = await response.json();
      
      // If owner has permissions for this foodcourt, use them
      const ownerPermission = foodcourtId 
        ? data.find((p: OwnerPermission) => p.foodcourtId === foodcourtId)
        : data[0];
      
      if (ownerPermission) {
        setPermissions({
          canEditMenu: ownerPermission.canEditMenu,
          canViewOrders: ownerPermission.canViewOrders,
          canUpdateOrders: ownerPermission.canUpdateOrders,
        });
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/permissions/defaults");
      
      if (!response.ok) {
        throw new Error("Failed to fetch default permissions");
      }
      
      const data = await response.json();
      setPermissions({
        canEditMenu: data.canEditMenu,
        canViewOrders: data.canViewOrders,
        canUpdateOrders: data.canUpdateOrders,
      });
    } catch (error) {
      console.error("Error fetching default permissions:", error);
      toast.error("Failed to load default permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = (permission: keyof typeof permissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      let url = isDefault 
        ? "/api/admin/permissions/defaults" 
        : `/api/admin/owners/${ownerId}/permissions`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(permissions),
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${isDefault ? "default " : ""}permissions`);
      }

      toast.success(`${isDefault ? "Default p" : "P"}ermissions saved successfully`);
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error(`Failed to save ${isDefault ? "default " : ""}permissions`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>
            {isDefault ? "Default Owner Permissions" : "Owner Permissions"}
          </CardTitle>
        </div>
        <CardDescription>
          {isDefault 
            ? "Configure default permissions for new owners" 
            : "Configure what this owner can do in their foodcourt"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <PermissionToggle
              id="canEditMenu"
              label="Edit Menu"
              description="Allow owner to add, edit, and remove menu items"
              checked={permissions.canEditMenu}
              onChange={(checked) => handleToggleChange("canEditMenu", checked)}
            />
            <PermissionToggle
              id="canViewOrders"
              label="View Orders"
              description="Allow owner to view incoming orders"
              checked={permissions.canViewOrders}
              onChange={(checked) => handleToggleChange("canViewOrders", checked)}
            />
            <PermissionToggle
              id="canUpdateOrders"
              label="Update Orders"
              description="Allow owner to update order status"
              checked={permissions.canUpdateOrders}
              onChange={(checked) => handleToggleChange("canUpdateOrders", checked)}
            />
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Permissions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
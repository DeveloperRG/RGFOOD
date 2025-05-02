"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  History,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { PermissionForm } from "~/components/dashboard/admin/owners/permissions/permission-form";

interface DefaultPermission {
  id: string;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function DefaultPermissionsPage() {
  const [defaultPermission, setDefaultPermission] = useState<DefaultPermission | null>(null);
  const [permissionHistory, setPermissionHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Fetch default permissions when component mounts
  useEffect(() => {
    fetchDefaultPermissions();
    fetchPermissionHistory();
  }, []);
  
  const fetchDefaultPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/permissions/defaults");
      
      if (!response.ok) {
        throw new Error("Failed to fetch default permissions");
      }
      
      const data = await response.json();
      setDefaultPermission(data);
    } catch (error) {
      console.error("Error fetching default permissions:", error);
      toast.error("Failed to load default permissions");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPermissionHistory = async () => {
    try {
      setIsLoadingHistory(true);
      // This is a simplified approach - in a real implementation, you would have a specific API
      // endpoint for default permission history
      const response = await fetch("/api/admin/permissions/history?limit=5");
      
      if (!response.ok) {
        throw new Error("Failed to fetch permission history");
      }
      
      const data = await response.json();
      // Filter for default permission changes only
      // This is a placeholder - in a real implementation, you would have specific filtering
      setPermissionHistory(data.data || []);
    } catch (error) {
      console.error("Error fetching permission history:", error);
      toast.error("Failed to load permission history");
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const handlePermissionSaved = () => {
    toast.success("Default permissions updated successfully");
    fetchDefaultPermissions();
    fetchPermissionHistory();
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Default Permissions</h1>
        <p className="text-muted-foreground">
          Configure default permissions for new owners
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Default Permissions Form */}
        <div className="md:col-span-2">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <PermissionForm 
              ownerId="default" 
              isDefault={true}
              initialPermissions={defaultPermission}
              onSaved={handlePermissionSaved}
            />
          )}
        </div>
        
        {/* Info and History */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About Default Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Default permissions are automatically applied to new owners when they are assigned to a foodcourt.
              </p>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">How it works:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>When an admin assigns an owner to a foodcourt, the system creates permissions based on these defaults</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Changes to default permissions only affect new owner assignments, not existing ones</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>You can always modify individual owner permissions later</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* History Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle>Recent Changes</CardTitle>
              </div>
              <CardDescription>
                Recent changes to default permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : permissionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No History Available</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no recent changes to default permissions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {permissionHistory.slice(0, 5).map((history) => (
                    <div key={history.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {format(new Date(history.changedAt), "PP")}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {history.changedBy.name || history.changedBy.email || "Unknown"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <h4 className="text-xs font-medium">Edit Menu</h4>
                          <div className="flex items-center space-x-1">
                            {history.previousSettings.canEditMenu ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">→</span>
                            {history.newSettings.canEditMenu ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium">View Orders</h4>
                          <div className="flex items-center space-x-1">
                            {history.previousSettings.canViewOrders ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">→</span>
                            {history.newSettings.canViewOrders ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium">Update Orders</h4>
                          <div className="flex items-center space-x-1">
                            {history.previousSettings.canUpdateOrders ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">→</span>
                            {history.newSettings.canUpdateOrders ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Shield,
  User,
  History,
  Calendar,
  MapPin,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { PermissionForm } from "~/components/dashboard/admin/owners/permissions/permission-form";
import { TemplateSelect } from "~/components/dashboard/admin/owners/permissions/template-select";
import { toast } from "sonner";
import { format } from "date-fns";

interface Owner {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: string;
  createdAt: Date;
  ownedFoodcourt?: {
    id: string;
    name: string;
    address: string;
  } | null;
}

interface PermissionHistory {
  id: string;
  permissionId: string;
  previousSettings: {
    canEditMenu: boolean;
    canViewOrders: boolean;
    canUpdateOrders: boolean;
  };
  newSettings: {
    canEditMenu: boolean;
    canViewOrders: boolean;
    canUpdateOrders: boolean;
  };
  changedAt: string;
  changedBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function OwnerPermissionsPage() {
  const params = useParams();
  const ownerId = params.id as string;
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [permissionHistory, setPermissionHistory] = useState<PermissionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState("permissions");
  
  // Fetch owner data
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/owners/${ownerId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch owner");
        }
        
        const data = await response.json();
        setOwner(data);
      } catch (error) {
        console.error("Error fetching owner:", error);
        toast.error("Failed to load owner data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (ownerId) {
      fetchOwner();
    }
  }, [ownerId]);
  
  // Fetch permission history
  const fetchPermissionHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/admin/owners/${ownerId}/permissions/history`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch permission history");
      }
      
      const data = await response.json();
      setPermissionHistory(data.data || []);
    } catch (error) {
      console.error("Error fetching permission history:", error);
      toast.error("Failed to load permission history");
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Load permission history when tab changes to history
  useEffect(() => {
    if (activeTab === "history" && ownerId) {
      fetchPermissionHistory();
    }
  }, [activeTab, ownerId]);
  
  const handlePermissionSaved = () => {
    toast.success("Permissions updated successfully");
    if (activeTab === "history") {
      fetchPermissionHistory();
    }
  };
  
  const handleTemplateApplied = () => {
    toast.success("Template applied successfully");
    if (activeTab === "history") {
      fetchPermissionHistory();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!owner) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Owner Not Found</h2>
        <p className="text-muted-foreground">
          The owner you are looking for does not exist or you don't have permission to view it.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Owner Permissions</h1>
        <p className="text-muted-foreground">
          Manage permissions for this owner
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-7">
        {/* Owner Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Owner Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Name</h3>
              <p>{owner.name || "—"}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{owner.email || "—"}</p>
            </div>
            <div>
              <h3 className="font-medium">Joined</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {owner.createdAt
                    ? format(new Date(owner.createdAt), "PPP")
                    : "—"}
                </span>
              </div>
            </div>
            {owner.ownedFoodcourt && (
              <div>
                <h3 className="font-medium">Foodcourt</h3>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.ownedFoodcourt.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {owner.ownedFoodcourt.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Permissions Management */}
        <div className="md:col-span-5 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="permissions" className="space-y-6 pt-4">
              {owner.ownedFoodcourt ? (
                <>
                  <PermissionForm 
                    ownerId={ownerId} 
                    foodcourtId={owner.ownedFoodcourt.id}
                    onSaved={handlePermissionSaved}
                  />
                  
                  <Separator className="my-6" />
                  
                  <TemplateSelect 
                    ownerId={ownerId} 
                    onTemplateApplied={handleTemplateApplied}
                  />
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Foodcourt Assigned</CardTitle>
                    <CardDescription>
                      This owner does not have a foodcourt assigned yet. Permissions can only be set for owners with foodcourts.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-primary" />
                    <CardTitle>Permission Change History</CardTitle>
                  </div>
                  <CardDescription>
                    View the history of permission changes for this owner
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : permissionHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium">No History Available</h3>
                      <p className="text-sm text-muted-foreground">
                        There are no permission changes recorded for this owner yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {permissionHistory.map((history) => (
                        <div key={history.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {format(new Date(history.changedAt), "PPP p")}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              by {history.changedBy.name || history.changedBy.email || "Unknown"}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Edit Menu</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {history.previousSettings.canEditMenu ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">Before</span>
                                </div>
                                <span className="text-sm">→</span>
                                <div className="flex items-center space-x-1">
                                  {history.newSettings.canEditMenu ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">After</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">View Orders</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {history.previousSettings.canViewOrders ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">Before</span>
                                </div>
                                <span className="text-sm">→</span>
                                <div className="flex items-center space-x-1">
                                  {history.newSettings.canViewOrders ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">After</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Update Orders</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {history.previousSettings.canUpdateOrders ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">Before</span>
                                </div>
                                <span className="text-sm">→</span>
                                <div className="flex items-center space-x-1">
                                  {history.newSettings.canUpdateOrders ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">After</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
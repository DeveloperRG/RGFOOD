"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { PermissionToggle } from "~/components/dashboard/admin/owners/permissions/permission-toggle";
import { format } from "date-fns";

interface PermissionTemplate {
  id: string;
  name: string;
  description: string | null;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function PermissionTemplatesPage() {
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<PermissionTemplate[]>([]);
  
  // Form state for create/edit
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<PermissionTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    canEditMenu: true,
    canViewOrders: true,
    canUpdateOrders: true,
  });
  
  // Fetch templates when component mounts
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Filter templates when search term changes
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredTemplates(
        templates.filter(
          template => 
            template.name.toLowerCase().includes(term) || 
            (template.description && template.description.toLowerCase().includes(term))
        )
      );
    } else {
      setFilteredTemplates(templates);
    }
  }, [searchTerm, templates]);
  
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/permission-templates");
      
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      
      const data = await response.json();
      setTemplates(data.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load permission templates");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (permission: keyof typeof formData, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [permission]: value,
    }));
  };
  
  const handleCreateTemplate = async () => {
    try {
      setIsCreating(true);
      
      const response = await fetch("/api/admin/permission-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create template");
      }
      
      toast.success("Template created successfully");
      fetchTemplates();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        canEditMenu: true,
        canViewOrders: true,
        canUpdateOrders: true,
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleEditTemplate = async () => {
    if (!currentTemplate) return;
    
    try {
      setIsEditing(true);
      
      const response = await fetch(`/api/admin/permission-templates/${currentTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update template");
      }
      
      toast.success("Template updated successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    } finally {
      setIsEditing(false);
      setCurrentTemplate(null);
    }
  };
  
  const handleDeleteTemplate = async () => {
    if (!currentTemplate) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/admin/permission-templates/${currentTemplate.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete template");
      }
      
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(false);
      setCurrentTemplate(null);
    }
  };
  
  const openEditDialog = (template: PermissionTemplate) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      canEditMenu: template.canEditMenu,
      canViewOrders: template.canViewOrders,
      canUpdateOrders: template.canUpdateOrders,
    });
  };
  
  const openDeleteDialog = (template: PermissionTemplate) => {
    setCurrentTemplate(template);
  };
  
  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Permission Templates</h1>
        <p className="text-muted-foreground">
          Create and manage permission templates for owners
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Template List */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Templates</CardTitle>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                      <DialogDescription>
                        Create a new permission template that can be applied to owners
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter template name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          name="description"
                          placeholder="Enter description"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <Label>Permissions</Label>
                        
                        <PermissionToggle
                          id="createCanEditMenu"
                          label="Edit Menu"
                          description="Allow owner to add, edit, and remove menu items"
                          checked={formData.canEditMenu}
                          onChange={(checked) => handleToggleChange("canEditMenu", checked)}
                        />
                        
                        <PermissionToggle
                          id="createCanViewOrders"
                          label="View Orders"
                          description="Allow owner to view incoming orders"
                          checked={formData.canViewOrders}
                          onChange={(checked) => handleToggleChange("canViewOrders", checked)}
                        />
                        
                        <PermissionToggle
                          id="createCanUpdateOrders"
                          label="Update Orders"
                          description="Allow owner to update order status"
                          checked={formData.canUpdateOrders}
                          onChange={(checked) => handleToggleChange("canUpdateOrders", checked)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleCreateTemplate} 
                        disabled={!formData.name || isCreating}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <CardDescription>
                Manage permission templates that can be applied to owners
              </CardDescription>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No Templates Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {templates.length === 0
                      ? "Create your first permission template to get started"
                      : "No templates match your search criteria"}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              {template.description && (
                                <div className="text-sm text-muted-foreground">
                                  {template.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">Menu:</span>
                                {template.canEditMenu ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">View:</span>
                                {template.canViewOrders ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">Update:</span>
                                {template.canUpdateOrders ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                  {format(new Date(template.createdAt), "PP")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="start">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Template Details</h4>
                                  <div className="text-sm">
                                    <div className="flex justify-between py-1">
                                      <span className="text-muted-foreground">Created on</span>
                                      <span>{format(new Date(template.createdAt), "PPP p")}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <span className="text-muted-foreground">Created by</span>
                                      <span>{template.createdBy.name || template.createdBy.email || "Unknown"}</span>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openEditDialog(template)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Template</DialogTitle>
                                    <DialogDescription>
                                      Update the permission template settings
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editName">Template Name</Label>
                                      <Input
                                        id="editName"
                                        name="name"
                                        placeholder="Enter template name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="editDescription">Description (Optional)</Label>
                                      <Input
                                        id="editDescription"
                                        name="description"
                                        placeholder="Enter description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                    
                                    <Separator className="my-4" />
                                    
                                    <div className="space-y-4">
                                      <Label>Permissions</Label>
                                      
                                      <PermissionToggle
                                        id="editCanEditMenu"
                                        label="Edit Menu"
                                        description="Allow owner to add, edit, and remove menu items"
                                        checked={formData.canEditMenu}
                                        onChange={(checked) => handleToggleChange("canEditMenu", checked)}
                                      />
                                      
                                      <PermissionToggle
                                        id="editCanViewOrders"
                                        label="View Orders"
                                        description="Allow owner to view incoming orders"
                                        checked={formData.canViewOrders}
                                        onChange={(checked) => handleToggleChange("canViewOrders", checked)}
                                      />
                                      
                                      <PermissionToggle
                                        id="editCanUpdateOrders"
                                        label="Update Orders"
                                        description="Allow owner to update order status"
                                        checked={formData.canUpdateOrders}
                                        onChange={(checked) => handleToggleChange("canUpdateOrders", checked)}
                                      />
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                      onClick={handleEditTemplate} 
                                      disabled={!formData.name || isEditing}
                                    >
                                      {isEditing ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        <>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Save Changes
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openDeleteDialog(template)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Template</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete this template? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {currentTemplate && (
                                    <div className="py-4">
                                      <div className="rounded-lg border p-4">
                                        <h3 className="font-medium">{currentTemplate.name}</h3>
                                        {currentTemplate.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {currentTemplate.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                      variant="destructive"
                                      onClick={handleDeleteTemplate} 
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Template
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Template Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Permission templates allow you to define sets of permissions that can be quickly applied to owners.
              </p>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Available Permissions:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Edit Menu</strong>: Allows owners to add, edit, and remove menu items in their foodcourt.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>View Orders</strong>: Allows owners to view incoming orders for their foodcourt.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Update Orders</strong>: Allows owners to update the status of orders in their foodcourt.</span>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Using Templates:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Create templates for different types of owners (e.g., "Full Access", "View Only", etc.)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Apply templates to individual owners from their permissions page</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Use bulk assignment to apply templates to multiple owners at once</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
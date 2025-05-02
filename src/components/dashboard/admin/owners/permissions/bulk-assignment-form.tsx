"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { Shield, Users, Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface Owner {
  id: string;
  name: string | null;
  email: string | null;
  ownedFoodcourt?: {
    id: string;
    name: string;
  } | null;
}

interface PermissionTemplate {
  id: string;
  name: string;
  description?: string;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
}

export function BulkAssignmentForm() {
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<PermissionTemplate | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHasFoodcourt, setFilterHasFoodcourt] = useState(true);

  // Fetch templates and owners when component mounts
  useEffect(() => {
    fetchTemplates();
    fetchOwners();
  }, []);

  // Update filtered owners when filters change
  useEffect(() => {
    let filtered = [...owners];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        owner => 
          (owner.name && owner.name.toLowerCase().includes(term)) || 
          (owner.email && owner.email.toLowerCase().includes(term))
      );
    }
    
    // Filter by foodcourt
    if (filterHasFoodcourt) {
      filtered = filtered.filter(owner => owner.ownedFoodcourt);
    }
    
    setFilteredOwners(filtered);
  }, [owners, searchTerm, filterHasFoodcourt]);

  // Update preview when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      setPreviewTemplate(template || null);
    } else {
      setPreviewTemplate(null);
    }
  }, [selectedTemplate, templates]);

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
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
      setIsLoadingTemplates(false);
    }
  };

  const fetchOwners = async () => {
    try {
      setIsLoadingOwners(true);
      const response = await fetch("/api/admin/users?role=OWNER");
      
      if (!response.ok) {
        throw new Error("Failed to fetch owners");
      }
      
      const data = await response.json();
      setOwners(data.data || []);
    } catch (error) {
      console.error("Error fetching owners:", error);
      toast.error("Failed to load owners");
    } finally {
      setIsLoadingOwners(false);
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedOwners(filteredOwners.map(owner => owner.id));
    } else {
      setSelectedOwners([]);
    }
  };

  const handleOwnerCheckChange = (ownerId: string, checked: boolean) => {
    if (checked) {
      setSelectedOwners(prev => [...prev, ownerId]);
    } else {
      setSelectedOwners(prev => prev.filter(id => id !== ownerId));
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    if (selectedOwners.length === 0) {
      toast.error("Please select at least one owner");
      return;
    }

    try {
      setIsApplying(true);
      const response = await fetch(`/api/admin/permission-templates/${selectedTemplate}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerIds: selectedOwners }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply template");
      }

      const result = await response.json();
      
      toast.success(`Template applied to ${result.summary.successful} owners successfully`);
      
      // Reset selections
      setSelectedOwners([]);
      setSelectedTemplate("");
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to apply template");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Bulk Permission Assignment</CardTitle>
        </div>
        <CardDescription>
          Apply permission templates to multiple owners at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label htmlFor="template">Select Permission Template</Label>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={isLoadingTemplates}
            >
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <SelectItem value="no-templates" disabled>
                    No templates available
                  </SelectItem>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {previewTemplate && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">{previewTemplate.name}</h4>
                    {previewTemplate.description && (
                      <p className="text-sm text-muted-foreground">
                        {previewTemplate.description}
                      </p>
                    )}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Edit Menu</span>
                        {previewTemplate.canEditMenu ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Orders</span>
                        {previewTemplate.canViewOrders ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Update Orders</span>
                        {previewTemplate.canUpdateOrders ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
        {/* Owner Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Filter Owners</Label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasFoodcourt" 
                checked={filterHasFoodcourt}
                onCheckedChange={(checked) => 
                  setFilterHasFoodcourt(checked === true)
                }
              />
              <Label htmlFor="hasFoodcourt" className="text-sm">
                Only show owners with foodcourts
              </Label>
            </div>
          </div>
          
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Owner Selection Table */}
        <div className="rounded-md border">
          {isLoadingOwners ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={
                        filteredOwners.length > 0 && 
                        selectedOwners.length === filteredOwners.length
                      }
                      onCheckedChange={handleSelectAllChange}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Foodcourt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No owners found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOwners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedOwners.includes(owner.id)}
                          onCheckedChange={(checked) => 
                            handleOwnerCheckChange(owner.id, checked === true)
                          }
                          aria-label={`Select ${owner.name}`}
                        />
                      </TableCell>
                      <TableCell>{owner.name || "—"}</TableCell>
                      <TableCell>{owner.email || "—"}</TableCell>
                      <TableCell>
                        {owner.ownedFoodcourt ? owner.ownedFoodcourt.name : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {selectedOwners.length} of {filteredOwners.length} owners selected
          </div>
          <div>
            Total: {owners.length} owners
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleApplyTemplate} 
          disabled={!selectedTemplate || selectedOwners.length === 0 || isApplying}
          className="w-full"
        >
          {isApplying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              Apply Template to {selectedOwners.length} Owner{selectedOwners.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
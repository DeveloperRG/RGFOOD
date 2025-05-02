"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { CheckCircle, XCircle, Info, Shield } from "lucide-react";
import { toast } from "sonner";

interface PermissionTemplate {
  id: string;
  name: string;
  description?: string;
  canEditMenu: boolean;
  canViewOrders: boolean;
  canUpdateOrders: boolean;
}

interface TemplateSelectProps {
  ownerId: string;
  onTemplateApplied: () => void;
  disabled?: boolean;
}

export function TemplateSelect({
  ownerId,
  onTemplateApplied,
  disabled = false,
}: TemplateSelectProps) {
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PermissionTemplate | null>(null);

  // Fetch templates when component mounts
  useEffect(() => {
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
    
    fetchTemplates();
  }, []);

  // Update preview when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      setPreviewTemplate(template || null);
    } else {
      setPreviewTemplate(null);
    }
  }, [selectedTemplate, templates]);

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    try {
      setIsApplying(true);
      const response = await fetch(`/api/admin/permission-templates/${selectedTemplate}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerIds: [ownerId] }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply template");
      }

      toast.success("Template applied successfully");
      onTemplateApplied();
      setSelectedTemplate("");
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to apply template");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Apply Permission Template</h3>
      </div>
      
      <div className="flex items-center space-x-2">
        <Select
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-full">
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
      
      <Button 
        onClick={handleApplyTemplate} 
        disabled={!selectedTemplate || disabled || isApplying}
        className="w-full"
      >
        {isApplying ? "Applying..." : "Apply Template"}
      </Button>
    </div>
  );
}
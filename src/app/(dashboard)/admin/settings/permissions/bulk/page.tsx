"use client";

import React from "react";
import { Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { BulkAssignmentForm } from "~/components/dashboard/admin/owners/permissions/bulk-assignment-form";

export default function BulkPermissionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Permission Management</h1>
        <p className="text-muted-foreground">
          Apply permission templates to multiple owners at once
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bulk Assignment Form */}
        <div className="md:col-span-2">
          <BulkAssignmentForm />
        </div>
        
        {/* Info Card */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>About Bulk Management</CardTitle>
              </div>
              <CardDescription>
                Efficiently manage permissions for multiple owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bulk permission management allows you to apply a permission template to multiple owners at once, saving time when managing large numbers of owners.
              </p>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">How to use:</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                  <li>
                    <span className="font-medium">Select a template</span>: Choose a permission template to apply
                  </li>
                  <li>
                    <span className="font-medium">Filter owners</span>: Use the search and filters to find the owners you want to update
                  </li>
                  <li>
                    <span className="font-medium">Select owners</span>: Check the boxes next to the owners you want to update
                  </li>
                  <li>
                    <span className="font-medium">Apply template</span>: Click the "Apply Template" button to update all selected owners
                  </li>
                </ol>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium">Important Note</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Only owners with assigned foodcourts can have permissions. Owners without foodcourts will be skipped during the bulk update process.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
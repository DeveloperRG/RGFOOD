"use client";

import React from "react";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface PermissionToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function PermissionToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: PermissionToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label
          htmlFor={id}
          className={cn(
            "text-base font-medium",
            disabled && "text-muted-foreground"
          )}
        >
          {label}
        </Label>
        {description && (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              disabled && "opacity-70"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {checked ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
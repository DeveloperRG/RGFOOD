// ~/src/components/ui/image-upload.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Upload, X, RefreshCw } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  id: string;
  name?: string; // Make name optional to avoid conflicts with React Hook Form
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  defaultImage?: string; // URL of an existing image
  onChange?: (file: File | null) => void; // Added onChange prop
}

export function ImageUpload({
  id,
  name,
  label,
  description,
  required = false,
  className = "",
  defaultImage,
  onChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [isNewImageSelected, setIsNewImageSelected] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset preview if defaultImage changes
  useEffect(() => {
    if (!isNewImageSelected && defaultImage) {
      setPreview(defaultImage);
    }
  }, [defaultImage, isNewImageSelected]);

  // Create preview when file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      // If no file is selected and we had a new image selected previously,
      // revert to default image if available
      if (isNewImageSelected && defaultImage) {
        setPreview(defaultImage);
        setIsNewImageSelected(false);
      } else {
        setPreview(null);
      }

      // Call onChange with null to indicate no file is selected
      if (onChange) onChange(null);
      return;
    }

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsNewImageSelected(true);

    // Call onChange with the selected file
    if (onChange) onChange(file);

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleClearImage = () => {
    setPreview(null);
    setIsNewImageSelected(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Call onChange with null to indicate image was cleared
    if (onChange) onChange(null);
  };

  const handleResetToDefault = () => {
    if (defaultImage) {
      setPreview(defaultImage);
      setIsNewImageSelected(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call onChange with null to indicate reverting to default image
      if (onChange) onChange(null);
    }
  };

  // Use provided name or fallback to id if name is not provided
  const inputName = name || id;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="flex flex-col gap-4">
        {preview ? (
          <div className="relative w-full max-w-xs">
            <div className="relative aspect-square overflow-hidden rounded-md border">
              <Image
                src={preview}
                alt="Selected image"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              {isNewImageSelected && defaultImage && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-white"
                  onClick={handleResetToDefault}
                  title="Reset to original image"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={handleClearImage}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isNewImageSelected && (
              <div className="mt-1">
                <p className="text-xs font-medium text-blue-600">
                  New image selected
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Input
              id={id}
              name={inputName}
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
              required={required && !preview}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        )}

        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}
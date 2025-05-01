// ~/src/app/(dashboard)/admin/foodcourts/new/page.tsx

"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { ImageUpload } from "~/components/ui/image-upload";

// Type definition for owner
interface Owner {
  id: string;
  name: string | null;
  email: string | null;
}

// Page props interface to receive owners data
interface NewFoodcourtPageProps {
  potentialOwners: Owner[];
}

export default function NewFoodcourtPage({ potentialOwners = [] }: NewFoodcourtPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    ownerId: "",
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create form data for multipart/form-data submission
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description || "");
      submitData.append("address", formData.address);
      submitData.append("ownerId", formData.ownerId || "");
      submitData.append("isActive", formData.isActive ? "true" : "false");
      
      // Add image if selected
      if (image) {
        submitData.append("image", image);
      }

      // Submit to API endpoint
      const response = await fetch("/api/admin/foodcourts", {
        method: "POST",
        body: submitData,
        // No Content-Type header needed as fetch will set it automatically for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create foodcourt");
      }

      // Success handling
      toast.success(
         "Foodcourt created successfully"
      );
      
      // Redirect to foodcourts list
      router.push("/admin/foodcourts");
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error("Error creating foodcourt:", error);
      toast.error(
        "Failed to create foodcourt",
        );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Link href="/admin/foodcourts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourts
          </Button>
        </Link>
      </div>

      <div className="mb-">
        <h1 className="text-3xl font-bold tracking-tight">Add New Foodcourt</h1>
        <p className="text-muted-foreground">
          Create a new foodcourt in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foodcourt Information</CardTitle>
          <CardDescription>
            Enter the details for the new foodcourt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter foodcourt name"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  required
                />
              </div>

              <ImageUpload
                id="image"
                name="image"
                label="Foodcourt Image"
                description="Upload a logo or image for the foodcourt (recommended size: 500x500px)"
                onChange={handleImageChange}
              />

              <div className="grid gap-3">
                <Label htmlFor="ownerId">Owner</Label>
                <select
                  id="ownerId"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <option value="">Select an owner</option>
                  {potentialOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name || "Unnamed"} ({owner.email || "No email"})
                    </option>
                  ))}
                </select>
                {potentialOwners.length === 0 && (
                  <p className="text-sm text-yellow-600">
                    No available owners found. All foodcourt owners already have
                    a foodcourt assigned.
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  Select a foodcourt owner from the list of available owners
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  name="isActive" 
                  checked={formData.isActive}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Foodcourt"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
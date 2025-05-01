"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
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

// Define types
interface Owner {
  id: string;
  name: string | null;
  email: string | null;
}

interface Foodcourt {
  id: string;
  name: string;
  description: string | null;
  address: string;
  image: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  status: "BUKA" | "TUTUP";
  ownerId: string | null;
  owner: Owner | null;
}

export default function EditFoodcourtPage() {
  const params = useParams();
  const foodcourtId = params.id as string;
  const router = useRouter();

  // Component state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [foodcourt, setFoodcourt] = useState<Foodcourt | null>(null);
  const [potentialOwners, setPotentialOwners] = useState<Owner[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    isActive: true,
    status: "BUKA" as "BUKA" | "TUTUP",
    ownerId: "",
  });

  // Fetch foodcourt data
  useEffect(() => {
    async function fetchFoodcourt() {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching foodcourt data for ID: ${foodcourtId}`);
        const response = await fetch(`/api/admin/foodcourts/${foodcourtId}`);

        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch foodcourt: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Foodcourt data received:", data);

        setFoodcourt(data);

        // Initialize form data from fetched foodcourt
        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          isActive: data.isActive ?? true,
          status: data.status || "BUKA",
          ownerId: data.ownerId || "",
        });

        // Fetch potential owners
        await fetchPotentialOwners();
      } catch (error) {
        console.error("Error fetching foodcourt:", error);
        setError("Failed to load foodcourt data. Please try again.");
        toast.error("Failed to load foodcourt data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchPotentialOwners() {
      try {
        const response = await fetch("/api/admin/foodcourt-owners/available");
        if (!response.ok) {
          throw new Error("Failed to fetch available owners");
        }
        const data = await response.json();
        setPotentialOwners(data);
      } catch (error) {
        console.error("Error fetching potential owners:", error);
        // Continue anyway, as this isn't critical
        setPotentialOwners([]);
      }
    }

    if (foodcourtId) {
      fetchFoodcourt();
    }
  }, [foodcourtId]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  // Handle image change
  const handleImageChange = (file: File | null) => {
    setImage(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodcourt?.id) {
      toast.error("Cannot update: Missing foodcourt ID");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Preparing form data for submission");

      // Create form data for API request
      const submitData = new FormData();

      // Add form fields to FormData
      submitData.append("name", formData.name);
      submitData.append("description", formData.description || "");
      submitData.append("address", formData.address);
      submitData.append("isActive", formData.isActive.toString());
      submitData.append("status", formData.status);

      if (formData.ownerId) {
        submitData.append("ownerId", formData.ownerId);
      }

      // Add image if there's a new one
      if (image) {
        submitData.append("image", image);
      }

      console.log("Submitting form data to API...");

      // Send PUT request to API
      const response = await fetch(`/api/admin/foodcourts/${foodcourt.id}`, {
        method: "PUT",
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Failed to update foodcourt");
      }

      console.log("Foodcourt updated successfully");

      // Success!
      toast.success("Foodcourt updated successfully");

      // Redirect back to foodcourt details
      router.push(`/admin/foodcourts/${foodcourt.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating foodcourt:", error);
      toast.error(error.message || "Failed to update foodcourt");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-8">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading foodcourt data...</span>
      </div>
    );
  }

  // Show error state
  if (error || !foodcourt) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/admin/foodcourts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Foodcourts
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-destructive flex items-center text-lg">
            <AlertCircle className="mr-2 h-5 w-5" />
            {error || "Failed to load foodcourt data"}
          </div>
          <Button
            variant="default"
            onClick={() => router.push("/admin/foodcourts")}
          >
            Return to Foodcourt List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Link href={`/admin/foodcourts/${foodcourt.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourt
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Foodcourt</h1>
        <p className="text-muted-foreground">Update the foodcourt details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foodcourt Information</CardTitle>
          <CardDescription>
            Edit the details for {formData.name}
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
                description={
                  foodcourt.image
                    ? "Upload a new image to replace the current one"
                    : "Upload a logo or image for the foodcourt (recommended size: 500x500px)"
                }
                defaultImage={foodcourt.image || undefined}
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
                  <option value="">No owner assigned</option>
                  {potentialOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name || "Unnamed"} ({owner.email || "No email"})
                    </option>
                  ))}
                  {/* Include current owner if not in potential owners list */}
                  {foodcourt.owner &&
                    !potentialOwners.some(
                      (o) => o.id === foodcourt.owner?.id,
                    ) && (
                      <option
                        key={foodcourt.owner.id}
                        value={foodcourt.owner.id}
                      >
                        {foodcourt.owner.name || "Unnamed"} (
                        {foodcourt.owner.email || "No email"}) (Current)
                      </option>
                    )}
                </select>
                {potentialOwners.length === 0 && !foodcourt.owner && (
                  <p className="text-sm text-yellow-600">
                    No available owners found. All foodcourt owners already have
                    a foodcourt assigned.
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  Select a foodcourt owner from the list of available owners
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <option value="BUKA">Open</option>
                  <option value="TUTUP">Closed</option>
                </select>
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
                      Updating...
                    </>
                  ) : (
                    "Update Foodcourt"
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

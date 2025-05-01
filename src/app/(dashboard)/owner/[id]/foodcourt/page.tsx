// ~/app/(dashboard)/owner/[id]/foodcourt/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { ImageUpload } from "~/components/ui/image-upload";
import { FoodcourtStatus } from "@prisma/client";
import { ArrowLeft, Save, AlertCircle, Edit, X, Store } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

interface FoodcourtData {
  id: string;
  name: string;
  description: string | null;
  address: string;
  image: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  status: FoodcourtStatus;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    image: string | null;
  } | null;
  creator: {
    id: string;
    name: string | null;
    email: string | null;
  };
  categories: any[];
  menuItems: any[];
  ownerPermissions: any[];
}

export default function FoodcourtPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [foodcourt, setFoodcourt] = useState<FoodcourtData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch foodcourt data using owner ID
    const fetchFoodcourt = async () => {
      try {
        setLoading(true);
        // Using the enhanced API that accepts either foodcourt ID or owner ID
        const response = await fetch(`/api/foodcourt/${params.id}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setFoodcourt(data);

        // Set form data
        setFormData({
          name: data.name,
          description: data.description || "",
          address: data.address,
        });

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load foodcourt",
        );
        setLoading(false);
      }
    };

    if (params.id) {
      fetchFoodcourt();
    }
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection
  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  // Updated section of updateFoodcourtDetails function

  const updateFoodcourtDetails = async () => {
    try {
      setSaving(true);

      // Create FormData object to handle the image upload
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("address", formData.address);

      // Add image if we have a new one
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // Send the request with FormData
      const response = await fetch(`/api/foodcourt/${params.id}`, {
        method: "PUT",
        body: formDataToSend,
        // Important: Do NOT set Content-Type header when sending FormData
        // The browser will automatically set it with the correct boundary
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const updatedFoodcourt = await response.json();
      setFoodcourt((prev) =>
        prev ? { ...prev, ...updatedFoodcourt } : updatedFoodcourt,
      );
      toast.success("Foodcourt details updated successfully");
      setIsEditing(false);
      setImageFile(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update foodcourt",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateFoodcourtStatus = async (status: FoodcourtStatus) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/foodcourt/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const updatedFoodcourt = await response.json();
      setFoodcourt((prev) =>
        prev ? { ...prev, ...updatedFoodcourt } : updatedFoodcourt,
      );
      toast.success(`Foodcourt status updated to ${status}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to current foodcourt values
    if (foodcourt) {
      setFormData({
        name: foodcourt.name,
        description: foodcourt.description || "",
        address: foodcourt.address,
      });
    }
    setIsEditing(false);
    setImageFile(null);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">Loading foodcourt details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col gap-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Error Loading Foodcourt</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!foodcourt) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">Foodcourt not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Foodcourt Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Foodcourt Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Foodcourt Details</CardTitle>
                <CardDescription>
                  View and edit your foodcourt information
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foodcourt Image */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Foodcourt Image</h3>
                {!isEditing ? (
                  <div className="relative h-48 w-full max-w-md overflow-hidden rounded-md border">
                    {foodcourt.image ? (
                      <Image
                        src={foodcourt.image}
                        alt={foodcourt.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-muted/20 flex h-full w-full items-center justify-center">
                        <Store className="text-muted-foreground h-16 w-16" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative max-w-md">
                    <ImageUpload
                      id="image"
                      name="image"
                      label="Foodcourt Image"
                      description="Upload a logo or image for the foodcourt (recommended size: 500x500px)"
                      defaultImage={foodcourt.image || undefined}
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>

              {!isEditing ? (
                // View mode - Display information
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Name</h3>
                    <p>{foodcourt.name}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-muted-foreground">
                      {foodcourt.description || "No description provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Address</h3>
                    <p>{foodcourt.address}</p>
                  </div>
                </>
              ) : (
                // Edit mode - Show form inputs
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Foodcourt name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your foodcourt"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Foodcourt address"
                    />
                  </div>
                </>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={updateFoodcourtDetails} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Status and Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Status</CardTitle>
              <CardDescription>
                Set whether your foodcourt is open or closed today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <p className="text-muted-foreground mr-2 text-sm">
                      Current Status:
                    </p>
                    <Badge
                      className={
                        foodcourt.status === "BUKA"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {foodcourt.status === "BUKA" ? "OPEN" : "CLOSED"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    You can update this daily to let customers know if you're
                    open for business.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant={foodcourt.status === "BUKA" ? "outline" : "default"}
                  className="mb-2 w-full"
                  onClick={() => updateFoodcourtStatus("BUKA")}
                  disabled={
                    foodcourt.status === "BUKA" || saving || !foodcourt.isActive
                  }
                >
                  <span className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Set as Open for Today
                  </span>
                </Button>
                <Button
                  variant={foodcourt.status === "TUTUP" ? "outline" : "default"}
                  className="w-full"
                  onClick={() => updateFoodcourtStatus("TUTUP")}
                  disabled={
                    foodcourt.status === "TUTUP" ||
                    saving ||
                    !foodcourt.isActive
                  }
                >
                  <span className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                    Set as Closed for Today
                  </span>
                </Button>
              </div>

              {!foodcourt.isActive && (
                <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-medium">Notice:</p>
                  <p>
                    Your foodcourt is currently marked as inactive by the
                    administrator. You cannot change the operational status
                    until your foodcourt is activated.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Foodcourt Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-b pb-2">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Administrative Status</p>
                    <p className="text-muted-foreground text-xs">
                      Set by platform administrators
                    </p>
                  </div>
                  <Badge
                    variant={foodcourt.isActive ? "outline" : "destructive"}
                    className="self-start"
                  >
                    {foodcourt.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Created by:</p>
                <p className="text-muted-foreground text-sm">
                  {foodcourt.creator.name || foodcourt.creator.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Owner:</p>
                <p className="text-muted-foreground text-sm">
                  {foodcourt.owner?.name ||
                    foodcourt.owner?.email ||
                    "No owner assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Created:</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(foodcourt.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated:</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(foodcourt.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
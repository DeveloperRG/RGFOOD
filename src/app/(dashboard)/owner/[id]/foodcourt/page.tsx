// ~/app/(dashboard)/owner/[id]/foodcourt/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";

export default function FoodcourtManagementPage() {
  const { id: ownerId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    logo: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function fetchFoodcourt() {
      try {
        const res = await fetch(`/api/foodcourt/${ownerId}`, {
          credentials: "include", // ✅ include cookies for auth()
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            description: data.description || "",
            address: data.address || "",
            logo: data.logo || "",
            isActive: data.isActive,
          });
        } else {
          toast.error("Failed to load foodcourt data");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (ownerId) fetchFoodcourt();
  }, [ownerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/foodcourt/${ownerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // ✅ include session cookies
      });

      if (res.ok) {
        toast.success("Foodcourt updated successfully");
        setEditMode(false);
      } else {
        toast.error("Failed to update foodcourt");
      }
    } catch (err) {
      toast.error("An error occurred during update");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="mb-4 h-8 w-1/3" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Manage Your Foodcourt</h1>

      {!editMode ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div>
              <strong>Name:</strong> {formData.name}
            </div>
            <div>
              <strong>Description:</strong> {formData.description}
            </div>
            <div>
              <strong>Address:</strong> {formData.address}
            </div>
            <div>
              <strong>Logo:</strong>{" "}
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="mt-2 h-16 rounded"
                />
              ) : (
                <span className="text-gray-500">No logo uploaded</span>
              )}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={
                  formData.isActive ? "text-green-600" : "text-red-600"
                }
              >
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(val) =>
                setFormData((prev) => ({ ...prev, isActive: val }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

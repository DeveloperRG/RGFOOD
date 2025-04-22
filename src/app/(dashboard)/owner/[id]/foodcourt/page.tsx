"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";

export default function FoodcourtManagementPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    logo: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFoodcourt() {
      try {
        const res = await fetch(`/api/foodcourt/${id}`);
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

    if (id) fetchFoodcourt();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/foodcourt/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Foodcourt updated successfully");
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

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Manage Your Foodcourt</h1>
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
        <Button type="submit">Update</Button>
      </form>
    </div>
  );
}

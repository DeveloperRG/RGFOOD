// ~/app/(dashboard)/owner/[id]/foodcourt/menu/[menuId]/edit/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChevronLeft, Save, ImagePlus, X, Loader2 } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  isAvailable: boolean;
}

export default function EditMenuItemPage() {
  const params = useParams();
  const ownerId = params.id as string;
  const menuId = params.menuId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [originalData, setOriginalData] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string | number;
    imageUrl: string;
    categoryId: string;
    isAvailable: boolean;
  }>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: "",
    isAvailable: true,
  });

  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch menu item
        const menuRes = await fetch(`/api/foodcourt/${ownerId}/menu/${menuId}`);
        if (!menuRes.ok) {
          console.error("Failed to load menu item:", await menuRes.text());
          toast.error("Failed to load menu item");
          return;
        }

        const { menuItem } = await menuRes.json();
        console.log("Fetched menu item:", menuItem);
        setOriginalData(menuItem);

        // Fetch categories using standalone categories API
        const catRes = await fetch(`/api/categories`);
        if (catRes.ok) {
          const { categories } = await catRes.json();
          setCategories(categories || []);
        } else {
          console.error("Failed to fetch categories:", await catRes.text());
        }

        setFormData({
          name: menuItem.name || "",
          description: menuItem.description || "",
          price: menuItem.price || 0,
          imageUrl: menuItem.imageUrl || "",
          categoryId: menuItem.categoryId || "",
          isAvailable:
            menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (ownerId && menuId) fetchData();
  }, [ownerId, menuId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // Allow only digits and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setFormData((prev) => ({
        ...prev,
        price: value,
      }));
    }
  }

  function resetForm() {
    if (!originalData) return;

    setFormData({
      name: originalData.name || "",
      description: originalData.description || "",
      price: originalData.price || 0,
      imageUrl: originalData.imageUrl || "",
      categoryId: originalData.categoryId || "",
      isAvailable:
        originalData.isAvailable !== undefined
          ? originalData.isAvailable
          : true,
    });

    toast.info("Form has been reset to original values");
  }

  async function addNewCategory() {
    if (!newCategory.trim()) return;

    try {
      // Use standalone categories API for adding new category
      const res = await fetch(`/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (res.ok) {
        const category = await res.json();
        setCategories([...categories, category]);
        setFormData((prev) => ({ ...prev, categoryId: category.id }));
        setNewCategory("");
        setShowNewCategoryInput(false);
        toast.success("Category added");
      } else {
        const errorText = await res.text();
        console.error("Failed to add category:", errorText);
        toast.error("Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error("An error occurred");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Simple validation
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (Number(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    setSubmitting(true);

    // Prepare the data for submission with the proper types
    const submissionData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      imageUrl: formData.imageUrl,
      categoryId: formData.categoryId === "null" ? null : formData.categoryId,
      isAvailable: formData.isAvailable,
    };

    try {
      const res = await fetch(`/api/foodcourt/${ownerId}/menu/${menuId}`, {
        method: "PATCH", // Using PATCH instead of PUT to update only the specified fields
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        toast.success("Menu item updated successfully");
        router.push(`/owner/${ownerId}/foodcourt/menu/${menuId}`);
      } else {
        const errorText = await res.text();
        console.error("Failed to update menu item:", errorText);
        toast.error("Failed to update menu item");
      }
    } catch (err) {
      console.error("Error during submission:", err);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  function clearImage() {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4">
        <div className="flex items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="mt-4 h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div>
        <Button
          variant="ghost"
          className="mb-2 -ml-4 flex items-center gap-1"
          onClick={() =>
            router.push(`/owner/${ownerId}/foodcourt/menu/${menuId}`)
          }
        >
          <ChevronLeft className="h-4 w-4" /> Back to Item Details
        </Button>
        <h1 className="text-2xl font-bold">Edit Menu Item</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Item Details</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="text-xs"
          >
            Reset Changes
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute top-3 left-3">$</span>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                {showNewCategoryInput ? (
                  <div>
                    <Label htmlFor="newCategory">New Category</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addNewCategory}
                        className="shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground mt-1 h-auto p-0 text-xs"
                      onClick={() => setShowNewCategoryInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: value,
                          }))
                        }
                      >
                        <SelectTrigger id="categoryId" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">No Category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground mt-1 h-auto p-0 text-xs"
                      onClick={() => setShowNewCategoryInput(true)}
                    >
                      + Add New Category
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
                <div className="relative md:col-span-2">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      className="hover:bg-muted absolute top-2 right-2 rounded-full p-1"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex h-24 items-center justify-center rounded border p-4">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="max-h-20 max-w-full object-contain"
                      onError={() =>
                        setFormData((prev) => ({ ...prev, imageUrl: "" }))
                      }
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center text-center">
                      <ImagePlus className="mb-1 h-8 w-8" />
                      <span className="text-xs">Image Preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="isAvailable">Available for order</Label>
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isAvailable: checked }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/owner/${ownerId}/foodcourt/menu/${menuId}`)
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ~/app/(dashboard)/owner/[id]/foodcourt/menu/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { ImageUpload } from "~/components/ui/image-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  isAvailable: z.boolean(),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      isAvailable: true,
      categoryId: "",
    },
  });

  // Handle image change
  const handleImageChange = (file: File | null) => {
    setImage(file);
    console.log("Image changed:", file?.name);
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setSaving(true);
      console.log("Submitting form data:", values);
      console.log("Image file:", image);

      // Create a FormData object to handle the file upload
      const formData = new FormData();

      // Add form values to FormData
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("price", values.price.toString());
      formData.append("isAvailable", values.isAvailable.toString());

      if (values.categoryId) {
        formData.append("categoryId", values.categoryId);
      }

      // Add image if selected
      if (image) {
        formData.append("image", image);
      }

      console.log("Sending FormData to API...");

      // Send the request with FormData
      const response = await fetch(`/api/foodcourt/${params.id}/menu`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const newMenuItem = await response.json();
      console.log("Menu item created successfully:", newMenuItem);

      toast.success("Menu item created successfully");

      // Navigate to the menu item detail view
      router.push(`/owner/${params.id}/foodcourt/menu/${newMenuItem.id}`);
      router.refresh();
    } catch (err) {
      console.error("Error creating menu item:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create menu item",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push(`/owner/${params.id}/foodcourt/menu`)}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
          <h1 className="text-2xl font-bold">Add New Menu Item</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Menu Item</CardTitle>
          <CardDescription>
            Add a new item to your foodcourt menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Menu item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="100"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Price in IDR (e.g. 25000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this menu item"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short description of the menu item (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Menu Item Image</FormLabel>
                <div className="flex items-start space-x-2">
                  <FormItem className="flex-1">
                    <FormControl>
                      <ImageUpload
                        id="menu-image"
                        name="image"
                        label=""
                        description="Upload an image for this menu item (recommended size: 500x500px)"
                        onChange={handleImageChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
                <FormDescription>
                  Image will be displayed on menu listings and detail pages
                </FormDescription>
              </div>

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Availability</FormLabel>
                      <FormDescription>
                        Make this item available immediately?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/owner/${params.id}/foodcourt/menu`)
                  }
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Creating..." : "Create Menu Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
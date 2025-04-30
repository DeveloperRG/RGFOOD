// ~/app/(dashboard)/owner/[id]/foodcourt/menu/[menuId]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
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
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean(),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  foodcourtId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      isAvailable: true,
      categoryId: "",
    },
  });

  // Fetch menu item data when the component mounts
  useEffect(() => {
    async function fetchMenuItem() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/foodcourt/${params.id}/menu/${params.menuId}`,
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setMenuItem(data.menuItem);

        // Set form values
        form.reset({
          name: data.menuItem.name,
          description: data.menuItem.description || "",
          price: data.menuItem.price,
          imageUrl: data.menuItem.imageUrl || "",
          isAvailable: data.menuItem.isAvailable,
          categoryId: data.menuItem.categoryId || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch menu item",
        );
        toast.error("Failed to load menu item details");
      } finally {
        setLoading(false);
      }
    }

    if (params.id && params.menuId) {
      fetchMenuItem();
    }
  }, [params.id, params.menuId, form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setSaving(true);
      const response = await fetch(
        `/api/foodcourt/${params.id}/menu/${params.menuId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      toast.success("Menu item updated successfully");
      // Navigate back to the menu item detail view
      router.push(`/owner/${params.id}/foodcourt/menu/${params.menuId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update menu item",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <p>Loading menu item details...</p>
        </div>
      </div>
    );
  }

  if (error || !menuItem) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-xl font-semibold">Menu Item Not Found</h3>
          <p className="text-muted-foreground mb-6">
            {error || "The requested menu item could not be found."}
          </p>
          <Button
            onClick={() => router.push(`/owner/${params.id}/foodcourt/menu`)}
          >
            Return to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() =>
              router.push(`/owner/${params.id}/foodcourt/menu/${params.menuId}`)
            }
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Item Details
          </Button>
          <h1 className="text-2xl font-bold">Edit Menu Item</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {menuItem.name}</CardTitle>
          <CardDescription>
            Update the details of this menu item
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
                      <FormLabel>Name</FormLabel>
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
                      <FormLabel>Price</FormLabel>
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
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to an image of this menu item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Availability</FormLabel>
                      <FormDescription>
                        Is this menu item currently available?
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
                    router.push(
                      `/owner/${params.id}/foodcourt/menu/${params.menuId}`,
                    )
                  }
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
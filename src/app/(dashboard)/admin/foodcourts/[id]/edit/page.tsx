"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Schema for validating foodcourt data
const updateFoodcourtSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().nullable().optional(),
  address: z.string().min(1, { message: "Address is required" }),
  logo: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  ownerId: z.string().nullable().optional(),
});

type UpdateFoodcourtValues = z.infer<typeof updateFoodcourtSchema>;

interface FoodcourtOwner {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

interface Foodcourt {
  id: string;
  name: string;
  address: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  creatorId: string;
  owner: FoodcourtOwner | null;
  creator: FoodcourtOwner | null;
}

export default function EditFoodcourtPage() {
  const params = useParams();
  const router = useRouter();
  const foodcourtId = params.id as string;

  const [foodcourt, setFoodcourt] = useState<Foodcourt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [potentialOwners, setPotentialOwners] = useState<FoodcourtOwner[]>([]);

  // Initialize the form
  const form = useForm<UpdateFoodcourtValues>({
    resolver: zodResolver(updateFoodcourtSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      logo: "",
      isActive: true,
      ownerId: null,
    },
  });

  // Fetch potential owners
  useEffect(() => {
    async function fetchPotentialOwners() {
      try {
        const response = await fetch('/api/admin/users?role=FOODCOURT_OWNER');
        if (!response.ok) {
          throw new Error('Failed to fetch potential owners');
        }
        const data = await response.json();
        setPotentialOwners(data);
      } catch (error) {
        console.error('Error fetching potential owners:', error);
        toast.error('Failed to load potential owners');
      }
    }

    fetchPotentialOwners();
  }, []);

  // Fetch foodcourt data
  useEffect(() => {
    async function fetchFoodcourt() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/foodcourts/${foodcourtId}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.push("/admin/foodcourts");
            return;
          }
          throw new Error("Failed to fetch foodcourt");
        }

        const data = await response.json();
        setFoodcourt(data);

        // Set form values
        form.reset({
          name: data.name,
          description: data.description || "",
          address: data.address,
          logo: data.logo || "",
          isActive: data.isActive,
          ownerId: data.ownerId,
        });
      } catch (error) {
        toast.error("Failed to load foodcourt details. Please try again.");
        setError("Failed to load foodcourt details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (foodcourtId) {
      fetchFoodcourt();
    }
  }, [foodcourtId, router, form]);

  // Handle form submission
  async function onSubmit(data: UpdateFoodcourtValues) {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/foodcourts/${foodcourtId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update foodcourt");
      }

      toast.success("Foodcourt updated successfully");
      router.push(`/admin/foodcourts/${foodcourtId}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Display loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href={`/admin/foodcourts/${foodcourtId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Foodcourt
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="mt-2 h-4 w-[200px]" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!foodcourt && !loading) {
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold">Foodcourt not found</h2>
            <p className="text-muted-foreground mt-2">
              The requested foodcourt could not be found.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/foodcourts")}
            >
              Return to Foodcourts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Link href={`/admin/foodcourts/${foodcourtId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourt
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Foodcourt</h1>
        <p className="text-muted-foreground">
          Update the details for {foodcourt?.name}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Foodcourt Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter foodcourt name"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        {...field}
                        value={field.value || ""}
                        disabled={submitting}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the foodcourt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter address"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter logo URL"
                        {...field}
                        value={field.value || ""}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the foodcourt logo image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Set whether this foodcourt is active and visible to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={submitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select
                      disabled={submitting}
                      onValueChange={(value) => {
                        // If "none" is selected, set ownerId to null
                        field.onChange(value === "none" ? null : value);
                      }}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No owner</SelectItem>
                        {potentialOwners.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.name || "Unnamed"} ({owner.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a foodcourt owner or leave empty for no owner
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/foodcourts/${foodcourtId}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

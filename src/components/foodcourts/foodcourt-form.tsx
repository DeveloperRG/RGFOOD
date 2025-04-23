"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { useCreateFoodcourt, useUpdateFoodcourt } from "~/hooks/use-foodcourt";

import { Loader2 } from "lucide-react";
import {toast} from "sonner";

// Define the form schema
const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters"),
    logo: z.string().optional(),
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

type FoodcourtFormProps = {
    foodcourt?: {
        id: string;
        name: string;
        description: string | null;
        address: string;
        logo: string | null;
        isActive: boolean;
    };
};

export function FoodcourtForm({ foodcourt }: FoodcourtFormProps = {}) {
    const router = useRouter();
    const { create, isLoading: isCreating } = useCreateFoodcourt();
    const { update, isLoading: isUpdating } = useUpdateFoodcourt();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!foodcourt;
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: foodcourt?.name || "",
            description: foodcourt?.description || "",
            address: foodcourt?.address || "",
            logo: foodcourt?.logo || "",
            isActive: foodcourt?.isActive ?? true,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        try {
            if (isEditing && foodcourt) {
                const result = await update({
                    id: foodcourt.id,
                    ...data,
                });

                if (result) {
                    toast({
                        title: "Success",
                        description: "Foodcourt updated successfully",
                    });
                    router.push(`/admin/foodcourts/${foodcourt.id}`);
                }
            } else {
                const result = await create(data);

                if (result) {
                    toast({
                        title: "Success",
                        description: "Foodcourt created successfully",
                    });
                    router.push(`/admin/foodcourts/${result.id}`);
                }
            }
        } catch (error) {
            console.error("Error saving foodcourt:", error);
            toast({
                title: "Error",
                description: "Failed to save foodcourt",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Foodcourt" : "New Foodcourt"}</CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Update foodcourt information"
                        : "Fill in the details for the new foodcourt"}
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter foodcourt name" {...field} />
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
                                            placeholder="Enter foodcourt description"
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
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter foodcourt address" {...field} />
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
                                        <Input placeholder="Enter logo URL (optional)" {...field} value={field.value || ""} />
                                    </FormControl>
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
                                        <FormLabel className="text-base">
                                            Active Status
                                        </FormLabel>
                                        <CardDescription>
                                            Set whether this foodcourt is active and visible to customers
                                        </CardDescription>
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
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isCreating || isUpdating}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditing ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>{isEditing ? "Update Foodcourt" : "Create Foodcourt"}</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
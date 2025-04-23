"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "~/components/ui/form";
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
import { Loader2 } from "lucide-react";
import { useUpdatePermissions } from "~/hooks/use-permissions";
import {toast} from "sonner";

// Define the form schema
const permissionsSchema = z.object({
    canEditMenu: z.boolean(),
    canViewOrders: z.boolean(),
    canUpdateOrders: z.boolean(),
});

type FormValues = z.infer<typeof permissionsSchema>;

interface EditPermissionsFormProps {
    ownerId: string;
    foodcourtId: string;
    foodcourtName: string;
    initialPermissions: {
        id: string;
        canEditMenu: boolean;
        canViewOrders: boolean;
        canUpdateOrders: boolean;
    } | null;
}

export function EditPermissionsForm({
                                        ownerId,
                                        foodcourtId,
                                        foodcourtName,
                                        initialPermissions
                                    }: EditPermissionsFormProps) {
    const router = useRouter();
    const { updatePermissions, isLoading, error } = useUpdatePermissions();

    // Initialize form with default or existing permissions
    const form = useForm<FormValues>({
        resolver: zodResolver(permissionsSchema),
        defaultValues: {
            canEditMenu: initialPermissions?.canEditMenu ?? true,
            canViewOrders: initialPermissions?.canViewOrders ?? true,
            canUpdateOrders: initialPermissions?.canUpdateOrders ?? true,
        },
    });

    const onSubmit = async (data: FormValues) => {
        const result = await updatePermissions({
            ownerId,
            foodcourtId,
            permissions: data,
        });

        if (result) {
            toast({
                title: "Success",
                description: "Permissions updated successfully",
            });

            router.push(`/admin/owners/${ownerId}`);
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: error || "Failed to update permissions",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Permissions for {foodcourtName}</CardTitle>
                <CardDescription>
                    Set what this owner is allowed to do with their foodcourt
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="canEditMenu"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Menu Management
                                        </FormLabel>
                                        <FormDescription>
                                            Allow owner to add, edit, and remove menu items
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

                        <FormField
                            control={form.control}
                            name="canViewOrders"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            View Orders
                                        </FormLabel>
                                        <FormDescription>
                                            Allow owner to view customer orders
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

                        <FormField
                            control={form.control}
                            name="canUpdateOrders"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Update Orders
                                        </FormLabel>
                                        <FormDescription>
                                            Allow owner to update order status
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
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save Permissions"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
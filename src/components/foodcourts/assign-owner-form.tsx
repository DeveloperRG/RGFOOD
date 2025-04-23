"use client";

import { useState, useEffect } from "react";
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
    FormMessage,
} from "~/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
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
import { useAssignOwner } from "~/hooks/use-foodcourt";
import { Loader2 } from "lucide-react";
import {toast} from "sonner";

// Define the form schema
const formSchema = z.object({
    ownerId: z.string().min(1, "Please select an owner"),
    permissions: z.object({
        canEditMenu: z.boolean().default(true),
        canViewOrders: z.boolean().default(true),
        canUpdateOrders: z.boolean().default(true),
    }),
});

type FormValues = z.infer<typeof formSchema>;

type Owner = {
    id: string;
    name: string | null;
    email: string | null;
};

interface AssignOwnerFormProps {
    foodcourtId: string;
    currentOwnerId?: string | null;
}

export function AssignOwnerForm({ foodcourtId, currentOwnerId }: AssignOwnerFormProps) {
    const router = useRouter();
    const { assign, isLoading, error } = useAssignOwner();
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ownerId: currentOwnerId || "",
            permissions: {
                canEditMenu: true,
                canViewOrders: true,
                canUpdateOrders: true,
            },
        },
    });

    // Fetch available owners
    useEffect(() => {
        const fetchOwners = async () => {
            setLoading(true);
            try {
                let url = `/api/admin/available-owners`;
                if (currentOwnerId) {
                    url += `?currentOwnerId=${currentOwnerId}`;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch owners");
                const data = await res.json();
                setOwners(data);
            } catch (error) {
                console.error("Error fetching owners:", error);
                toast({
                    title: "Error",
                    description: "Failed to load available owners",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, [currentOwnerId, toast]);

    const onSubmit = async (data: FormValues) => {
        const result = await assign({
            foodcourtId,
            ownerId: data.ownerId,
            permissions: data.permissions,
        });

        if (result) {
            toast({
                title: "Success",
                description: "Owner assigned successfully",
            });
            router.push(`/admin/foodcourts/${foodcourtId}`);
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: error || "Failed to assign owner",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assign Owner</CardTitle>
                <CardDescription>
                    Assign a foodcourt owner and set their permissions
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="ownerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Owner</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={loading || owners.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an owner" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loading ? (
                                                <div className="flex items-center justify-center p-4">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : owners.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    No available owners found
                                                </div>
                                            ) : (
                                                owners.map((owner) => (
                                                    <SelectItem key={owner.id} value={owner.id}>
                                                        {owner.name || "Unnamed"} ({owner.email})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {owners.length === 0 && !loading && (
                                        <FormDescription>
                                            No available owners found. You need to create users with the FOODCOURT_OWNER role first.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <h3 className="font-medium">Owner Permissions</h3>

                            <FormField
                                control={form.control}
                                name="permissions.canEditMenu"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Can Edit Menu</FormLabel>
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
                                name="permissions.canViewOrders"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Can View Orders</FormLabel>
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
                                name="permissions.canUpdateOrders"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Can Update Orders</FormLabel>
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
                        </div>
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
                            disabled={isLoading || loading || owners.length === 0}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign Owner"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
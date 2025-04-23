"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
    Search,
    Edit,
    Trash2,
    Eye,
    ToggleLeft,
    ToggleRight,
    UserPlus
} from "lucide-react";
import { Input } from "~/components/ui/input";
import Link from "next/link";
import {toast} from "sonner";
import { useToggleFoodcourtStatus, useDeleteFoodcourt } from "~/hooks/use-foodcourt";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";


type Foodcourt = {
    id: string;
    name: string;
    description: string | null;
    address: string;
    isActive: boolean;
    createdAt: string;
    owner: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
    creator: {
        id: string;
        name: string | null;
        email: string | null;
    };
};

export function FoodcourtList() {
    const [foodcourts, setFoodcourts] = useState<Foodcourt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { toggle, isLoading: isToggling } = useToggleFoodcourtStatus();
    const { remove, isLoading: isDeleting } = useDeleteFoodcourt();

    useEffect(() => {
        const fetchFoodcourts = async () => {
            setLoading(true);
            try {
                let url = `/api/admin/foodcourts?search=${search}`;
                if (activeFilter !== null) {
                    url += `&isActive=${activeFilter}`;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch foodcourts");
                const data = await res.json();
                setFoodcourts(data.data);
            } catch (error) {
                console.error("Error fetching foodcourts:", error);
                toast({
                    title: "Error",
                    description: "Failed to load foodcourts",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFoodcourts();
    }, [search, activeFilter, toast]);

    const handleToggleStatus = async (id: string) => {
        const result = await toggle({ id });
        if (result) {
            setFoodcourts(
                foodcourts.map((fc) =>
                    fc.id === id ? { ...fc, isActive: !fc.isActive } : fc
                )
            );
            toast({
                title: "Success",
                description: "Foodcourt status updated",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to update foodcourt status",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const success = await remove({ id: deleteId });
        if (success) {
            setFoodcourts(foodcourts.filter((fc) => fc.id !== deleteId));
            toast({
                title: "Success",
                description: "Foodcourt deleted successfully",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to delete foodcourt",
                variant: "destructive",
            });
        }

        setDeleteId(null);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>All Foodcourts</CardTitle>
                    <CardDescription>
                        Manage foodcourts and their owners
                    </CardDescription>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search foodcourts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={activeFilter === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveFilter(null)}
                            >
                                All
                            </Button>
                            <Button
                                variant={activeFilter === "true" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveFilter("true")}
                            >
                                Active
                            </Button>
                            <Button
                                variant={activeFilter === "false" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveFilter("false")}
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {foodcourts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            No foodcourts found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    foodcourts.map((foodcourt) => (
                                        <TableRow key={foodcourt.id}>
                                            <TableCell className="font-medium">
                                                {foodcourt.name}
                                            </TableCell>
                                            <TableCell>{foodcourt.address}</TableCell>
                                            <TableCell>
                                                {foodcourt.owner ? (
                                                    <span>
                                                        {foodcourt.owner.name || foodcourt.owner.email}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">
                                                        No owner assigned
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {foodcourt.creator.name || foodcourt.creator.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={foodcourt.isActive ? "success" : "destructive"}
                                                >
                                                    {foodcourt.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/foodcourts/${foodcourt.id}`}>
                                                        <Button size="icon" variant="ghost">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/foodcourts/${foodcourt.id}/edit`}>
                                                        <Button size="icon" variant="ghost">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isToggling}
                                                        onClick={() => handleToggleStatus(foodcourt.id)}
                                                    >
                                                        {foodcourt.isActive ? (
                                                            <ToggleRight className="h-4 w-4" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isDeleting}
                                                        onClick={() => setDeleteId(foodcourt.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    {!foodcourt.owner && (
                                                        <Link href={`/admin/foodcourts/${foodcourt.id}/assign`}>
                                                            <Button size="icon" variant="ghost">
                                                                <UserPlus className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the foodcourt and all related data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            {isDeleting ? (
                                <div className="flex items-center">
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    Deleting...
                                </div>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
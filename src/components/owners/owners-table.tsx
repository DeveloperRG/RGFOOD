// noinspection TypeScriptValidateTypes

"use client";

import { useState } from "react";
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
import { Search, Eye, UserCog } from "lucide-react";
import { Input } from "~/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";

type Owner = {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
    emailVerified: Date | null;
    ownedFoodcourts: Array<{
        id: string;
        name: string;
        isActive: boolean;
    }>;
    permissions: Array<{
        id: string;
        canEditMenu: boolean;
        canViewOrders: boolean;
        canUpdateOrders: boolean;
        foodcourtId: string;
    }>;
};

interface OwnersTableProps {
    owners: Owner[];
}

export function OwnersTable({ owners }: OwnersTableProps) {
    const [search, setSearch] = useState("");

    // Filter owners based on search
    const filteredOwners = owners.filter((owner) => {
        const searchLower = search.toLowerCase();
        return (
            (owner.name?.toLowerCase().includes(searchLower) ?? false) ||
            (owner.email?.toLowerCase().includes(searchLower) ?? false) ||
            owner.ownedFoodcourts.some((fc) =>
                fc.name.toLowerCase().includes(searchLower)
            )
        );
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Owners</CardTitle>
                <CardDescription>
                    View and manage foodcourt owners
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search owners..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Foodcourt</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOwners.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No owners found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOwners.map((owner) => (
                                <TableRow key={owner.id}>
                                    <TableCell className="font-medium">
                                        {owner.name || "—"}
                                    </TableCell>
                                    <TableCell>{owner.email}</TableCell>
                                    <TableCell>
                                        {owner.ownedFoodcourts.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {owner.ownedFoodcourts.map((fc) => (
                                                    <div key={fc.id} className="flex items-center gap-2">
                                                        <Link href={`/admin/foodcourts/${fc.id}`} className="hover:underline">
                                                            {fc.name}
                                                        </Link>
                                                        <Badge
                                                            variant={fc.isActive ? "success" : "destructive"}
                                                            className="text-xs"
                                                        >
                                                            {fc.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">
                                                Not assigned
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={owner.emailVerified ? "success" : "destructive"}
                                        >
                                            {owner.emailVerified ? "Yes" : "No"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(owner.createdAt), "PP")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/owners/${owner.id}`}>
                                                <Button size="icon" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {owner.ownedFoodcourts.length > 0 && (
                                                <Link href={`/admin/owners/${owner.id}/permissions`}>
                                                    <Button size="icon" variant="ghost">
                                                        <UserCog className="h-4 w-4" />
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
            </CardContent>
        </Card>
    );
}
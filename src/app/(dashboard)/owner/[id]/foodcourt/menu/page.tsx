// ~/app/(dashboard)/owner/[id]/foodcourt/menu/page.tsx

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
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  FilterIcon,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

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

export default function MenuListPage() {
  const params = useParams();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        let url = `/api/foodcourt/${params.id}/menu`;

        // Add any filters
        const queryParams = new URLSearchParams();
        if (availabilityFilter !== null) {
          queryParams.append("available", availabilityFilter);
        }
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setMenuItems(data.menuItems);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch menu items",
        );
        toast.error("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMenuItems();
    }
  }, [params.id, availabilityFilter]);

  const toggleItemAvailability = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    try {
      const response = await fetch(
        `/api/foodcourt/${params.id}/menu/${itemId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAvailable: !currentStatus }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const updatedItem = await response.json();

      // Update the local state with the updated item
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, isAvailable: updatedItem.isAvailable }
            : item,
        ),
      );

      toast.success(
        `Item ${updatedItem.isAvailable ? "available" : "unavailable"}`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update availability",
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/foodcourt/${params.id}/menu/${itemId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      // Remove the item from the local state
      setMenuItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId),
      );
      toast.success("Menu item deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete menu item",
      );
    }
  };

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push(`/owner/${params.id}/foodcourt`)}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourt
          </Button>
          <h1 className="text-2xl font-bold">Menu Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your foodcourt menu items, prices, and availability.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAvailabilityFilter(null)}>
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter("true")}>
                Available Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter("false")}>
                Unavailable Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() =>
              router.push(`/owner/${params.id}/foodcourt/menu/new`)
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p>Loading menu items...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="mb-4 text-red-500">{error}</p>
            <Button onClick={() => router.refresh()}>Try Again</Button>
          </CardContent>
        </Card>
      ) : filteredMenuItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="mb-2 text-xl font-semibold">No Menu Items Found</h3>
            {searchQuery || availabilityFilter ? (
              <p className="text-muted-foreground mb-6">
                Try changing your filters or search query.
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">
                Add your first menu item to get started.
              </p>
            )}
            <Button
              onClick={() =>
                router.push(`/owner/${params.id}/foodcourt/menu/new`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Badge variant="outline">
                {filteredMenuItems.length}{" "}
                {filteredMenuItems.length === 1 ? "Item" : "Items"}
              </Badge>
            </div>
            {availabilityFilter && (
              <CardDescription>
                Filtered by:{" "}
                {availabilityFilter === "true"
                  ? "Available Items"
                  : "Unavailable Items"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="h-10 w-10 overflow-hidden rounded-md">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md">
                            <span className="text-xs">No img</span>
                          </div>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(item.price)}
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() =>
                            toggleItemAvailability(item.id, item.isAvailable)
                          }
                          id={`available-${item.id}`}
                        />
                        <Label htmlFor={`available-${item.id}`}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/owner/${params.id}/foodcourt/menu/${item.id}`,
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/owner/${params.id}/foodcourt/menu/${item.id}/edit`,
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
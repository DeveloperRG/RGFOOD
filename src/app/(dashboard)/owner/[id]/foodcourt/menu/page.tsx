// ~/app/(dashboard)/owner/[id]/foodcourt/menu/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Plus, Search, Edit, Eye, ChevronLeft, Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  category: Category | null;
  categoryId: string | null;
}

export default function MenuListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const res = await fetch(`/api/foodcourt/${id}/menu`);
if (res.ok) {
  const { menuItems } = await res.json(); // ✅ Destructure correctly
  setMenuItems(menuItems);

  const uniqueCategories = Array.from(
    new Set(
      menuItems
        .filter((item: { category: null; }) => item.category !== null)
        .map((item: { category: any; }) => item.category),
    ),
  );
  setCategories(uniqueCategories as Category[]);
}

        else {
          toast.error("Failed to load menu items");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchMenuItems();
  }, [id]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );

    const matchesCategory =
      categoryFilter === "all" || item.categoryId === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && item.isAvailable) ||
      (availabilityFilter === "unavailable" && !item.isAvailable);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  async function toggleAvailability(itemId: string, currentStatus: boolean) {
    try {
      const res = await fetch(
        `/api/foodcourt/${id}/menu/${itemId}/availability`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !currentStatus }),
        },
      );

      if (res.ok) {
        setMenuItems(
          menuItems.map((item) =>
            item.id === itemId
              ? { ...item, isAvailable: !currentStatus }
              : item,
          ),
        );
        toast.success(
          `Item ${!currentStatus ? "available" : "unavailable"} now`,
        );
      } else {
        toast.error("Failed to update availability");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-4 flex items-center gap-1"
            onClick={() => router.push(`/owner/${id}`)}
          >
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Menu Management</h1>
        </div>

        <Button
          onClick={() => router.push(`/owner/${id}/foodcourt/menu/new`)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add New Item
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3 md:flex-row">
        <div className="relative flex-grow">
          <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Search menu items..."
            className="pr-4 pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <Filter className="text-muted-foreground h-4 w-4" />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No menu items found.</p>
          {menuItems.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setAvailabilityFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-40 w-full">
                <img
                  src={item.imageUrl || "/api/placeholder/400/250"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <Badge
                  className="absolute top-2 right-2"
                  variant={item.isAvailable ? "default" : "secondary"}
                >
                  {item.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    {item.category && (
                      <Badge variant="outline" className="mt-1">
                        {item.category.name}
                      </Badge>
                    )}
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-lg font-bold">
                    ${Number(item.price).toFixed(2)}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`available-${item.id}`} className="text-sm">
                      Availability
                    </Label>
                    <Switch
                      id={`available-${item.id}`}
                      checked={item.isAvailable}
                      onCheckedChange={() =>
                        toggleAvailability(item.id, item.isAvailable)
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/owner/${id}/foodcourt/menu/${item.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(
                          `/owner/${id}/foodcourt/menu/${item.id}/edit`,
                        )
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

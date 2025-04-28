// ~/src/app/(public)/table/[id]/foodcourt/[foodcourtId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  ShoppingBag,
  Plus,
  Loader2,
  X,
  Tag,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  itemCount: number;
}

interface FoodcourtCategory {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
}

interface Foodcourt {
  id: string;
  name: string;
  description: string | null;
  address: string;
  logo: string | null;
}

export default function FoodcourtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  const foodcourtId = params.foodcourtId as string;

  const [foodcourt, setFoodcourt] = useState<Foodcourt | null>(null);
  const [foodcourtCategories, setFoodcourtCategories] = useState<
    FoodcourtCategory[]
  >([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Function to add item to cart
  const addToCart = (item: MenuItem) => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(
        (cartItem: any) => cartItem.id === item.id,
      );

      if (existingItemIndex !== -1) {
        // Increment quantity if item already exists
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item with quantity 1
        cart.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          foodcourtId,
          tableId,
          imageUrl: item.imageUrl,
          categoryName: item.category?.name || "Uncategorized",
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
    }
  };

  // Update cart count from localStorage
  const updateCartCount = () => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      setCartCount(count);
    }
  };

  // Fetch foodcourt details
  useEffect(() => {
    async function fetchFoodcourt() {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/foodcourt/${foodcourtId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch foodcourt details");
        }

        const data = await response.json();
        setFoodcourt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchFoodcourt();
  }, [foodcourtId]);

  // Fetch foodcourt categories (what the foodcourt specializes in)
  useEffect(() => {
    async function fetchFoodcourtCategories() {
      try {
        const response = await fetch(
          `/api/public/foodcourt/${foodcourtId}/categories`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch foodcourt categories");
        }

        const data = await response.json();
        setFoodcourtCategories(data);
      } catch (err) {
        console.error("Error fetching foodcourt categories:", err);
        // Not setting error state as this is not critical
      }
    }

    fetchFoodcourtCategories();
  }, [foodcourtId]);

  // Fetch menu categories
  useEffect(() => {
    async function fetchMenuCategories() {
      try {
        const response = await fetch(
          `/api/public/foodcourt/${foodcourtId}/menu/categories`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch menu categories");
        }

        const data = await response.json();
        setMenuCategories(data);

        // If we have categories and no selected category yet, select the first one
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching menu categories:", err);
        // We won't set error state here as we can still show menu items without categories
      } finally {
        setLoading(false);
      }
    }

    fetchMenuCategories();
  }, [foodcourtId, selectedCategory]);

  // Fetch menu items when category changes
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setCategoryLoading(true);
        let url = `/api/public/foodcourt/${foodcourtId}/menu`;

        if (selectedCategory) {
          url += `?categoryId=${selectedCategory}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }

        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setMenuItems([]);
      } finally {
        setCategoryLoading(false);
      }
    }

    // Only fetch if we have a foodcourt and it's not in loading state
    if (foodcourtId && !loading) {
      fetchMenuItems();
    }
  }, [foodcourtId, selectedCategory, loading]);

  // Update cart count on component mount
  useEffect(() => {
    updateCartCount();
  }, []);

  // Filter menu items based on search
  const filteredItems =
    searchQuery.trim() === ""
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description &&
              item.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())),
        );

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/table/${tableId}`)}
          >
            Back to Foodcourts
          </Button>
        </div>
      </div>
    );
  }

  // Default tab value when no categories are available
  const defaultTabValue = "";

  // Find the current selected category or use the first one if available
  const currentTabValue =
    selectedCategory ||
    (menuCategories.length > 0 ? menuCategories[0]?.id : defaultTabValue);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white p-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center">
            <Link href={`/table/${tableId}`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            {!isSearchActive && foodcourt && (
              <h1 className="text-lg font-semibold">{foodcourt.name}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSearchActive ? (
              <div className="relative w-56">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-7 w-7"
                  onClick={() => {
                    setIsSearchActive(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchActive(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Foodcourt Details with FoodcourtCategories */}
      {!isSearchActive && foodcourt && (
        <div className="bg-white p-4 shadow-sm">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-4">
              {foodcourt.logo ? (
                <div className="h-20 w-20 overflow-hidden rounded-lg">
                  <img
                    src={foodcourt.logo}
                    alt={foodcourt.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold">{foodcourt.name}</h2>
                {foodcourt.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {foodcourt.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {foodcourt.address}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="mr-2 inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Table #{tableId}
                  </span>

                  {/* Display Foodcourt Categories */}
                  {foodcourtCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {foodcourtCategories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                          className="bg-gray-100"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Categories Tabs (only show if not searching and have categories) */}
      {!isSearchActive && menuCategories.length > 0 && (
        <div className="sticky top-16 z-10 bg-white shadow-sm">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-x-auto">
              <Tabs
                value={currentTabValue}
                onValueChange={setSelectedCategory}
                className="w-full"
                defaultValue={
                  menuCategories.length > 0
                    ? menuCategories[0]?.id
                    : defaultTabValue
                }
              >
                <div className="px-4">
                  <TabsList className="h-12 w-full justify-start gap-2 rounded-none border-b bg-transparent p-0">
                    {menuCategories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="h-10 rounded-md border border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none"
                      >
                        {category.name}
                        <span className="ml-1 text-xs">
                          ({category.itemCount})
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="mx-auto max-w-6xl p-4">
        {categoryLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : isSearchActive ? (
          // Show search results
          <>
            <h3 className="mb-4 text-lg font-medium">
              {filteredItems.length > 0
                ? `Search results for "${searchQuery}"`
                : `No results for "${searchQuery}"`}
            </h3>

            {filteredItems.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={() => addToCart(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  No menu items found matching your search.
                </p>
                <Button className="mt-4" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </>
        ) : (
          // Show category content
          <div className="space-y-6">
            {menuCategories.length > 0 && selectedCategory ? (
              // Find and display the selected category
              menuCategories
                .filter((category) => category.id === selectedCategory)
                .map((category) => (
                  <div key={category.id}>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      {category.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {filteredItems.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {filteredItems.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onAddToCart={() => addToCart(item)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">
                          No menu items available in this category.
                        </p>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  {menuCategories.length === 0
                    ? "No menu categories available."
                    : "Please select a category to view menu items."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Button */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white px-4 py-3 shadow-md">
          <Link href="/cart">
            <Button className="w-full bg-green-500 text-white hover:bg-green-600">
              View Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({
  item,
  onAddToCart,
}: {
  item: MenuItem;
  onAddToCart: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {item.imageUrl ? (
            <div className="relative h-24 w-24 bg-gray-100">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center bg-gray-100">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          <div className="flex flex-1 p-3">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {item.description}
                </p>
              )}
              <p className="mt-2 font-semibold text-green-600">
                Rp {item.price.toLocaleString()}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-green-500 hover:bg-green-50 hover:text-green-600"
              onClick={onAddToCart}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
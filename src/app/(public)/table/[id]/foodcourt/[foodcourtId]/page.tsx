"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search, ShoppingCart, Minus, Plus, X } from "lucide-react";
import Link from "next/link";

// Define types
enum CategoryType {
  MAKANAN_UTAMA = "MAKANAN_UTAMA",
  MINUMAN = "MINUMAN",
  CEMILAN = "CEMILAN",
  MAKANAN_MANIS = "MAKANAN_MANIS",
}

enum FoodcourtStatus {
  BUKA = "BUKA",
  TUTUP = "TUTUP",
}

type Foodcourt = {
  id: string;
  name: string;
  status: FoodcourtStatus;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  imagePublicId: string | null;
  isAvailable: boolean;
  categoryId: string | null;
};

interface TableInfo {
  id: string;
  tableNumber: string;
  capacity: number;
  isAvailable: boolean;
  activeSession: {
    id: string;
    sessionStart: string;
  } | null;
  hasActiveOrder: boolean;
}

type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  foodcourtId: string;
  foodcourtName: string;
  specialInstructions?: string;
};

const categoryLabels = {
  [CategoryType.MAKANAN_UTAMA]: "Makanan Utama",
  [CategoryType.MINUMAN]: "Minuman",
  [CategoryType.CEMILAN]: "Jajanan",
  [CategoryType.MAKANAN_MANIS]: "Pemanis",
};

export default function FoodcourtMenuPage() {
  const router = useRouter();
  const { id: tableId, foodcourtId } = useParams();

  const [foodcourt, setFoodcourt] = useState<Foodcourt | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // New states for quantity controls and popup
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null,
  );
  const [showPopup, setShowPopup] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // New state to track which items are in the cart
  const [itemsInCart, setItemsInCart] = useState<Record<string, boolean>>({});

  // Initialize quantities for each menu item and track which items are in cart
  useEffect(() => {
    if (menuItems.length === 0) return;

    const quantities: Record<string, number> = {};
    const inCart: Record<string, boolean> = {};

    menuItems.forEach((item) => {
      quantities[item.id] = 1;
      inCart[item.id] = false;
    });

    // Check if items are already in cart
    const cart = localStorage.getItem("cart");
    if (cart) {
      try {
        const cartData = JSON.parse(cart);
        if (cartData.items && cartData.items.length > 0) {
          cartData.items.forEach((item: CartItem) => {
            if (item.menuItemId) {
              quantities[item.menuItemId] = item.quantity;
              inCart[item.menuItemId] = true;
            }
          });
        }
      } catch (err) {
        console.error("Error parsing cart data:", err);
      }
    }

    setItemQuantities(quantities);
    setItemsInCart(inCart);
  }, [menuItems]);

  // Fetch table information
  useEffect(() => {
    async function fetchTableInfo() {
      try {
        const response = await fetch(`/api/public/tables/${tableId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch table information");
        }

        const data = await response.json();
        setTableInfo(data);
      } catch (err) {
        console.error("Error fetching table info:", err);
      }
    }

    if (tableId) {
      fetchTableInfo();
    }
  }, [tableId]);

  // Fetch cart count and update states based on cart changes
  const updateCartState = useCallback(() => {
    const cart = localStorage.getItem("cart");
    if (!cart) {
      setCartCount(0);
      // Reset all items to not in cart - but don't do this if we don't have menuItems yet
      if (menuItems.length > 0) {
        const newInCart: Record<string, boolean> = {};
        menuItems.forEach((item) => {
          newInCart[item.id] = false;
        });
        setItemsInCart(newInCart);
      }
      return;
    }

    try {
      const cartData = JSON.parse(cart);
      const itemCount = cartData.items
        ? cartData.items.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0,
          )
        : 0;
      setCartCount(itemCount);

      // Only update if we have menuItems
      if (menuItems.length > 0) {
        // Update which items are in cart
        const newInCart: Record<string, boolean> = {};
        const newQuantities = { ...itemQuantities };

        menuItems.forEach((item) => {
          newInCart[item.id] = false;
        });

        if (cartData.items) {
          cartData.items.forEach((item: CartItem) => {
            if (item.menuItemId) {
              newInCart[item.menuItemId] = true;
              newQuantities[item.menuItemId] = item.quantity;
            }
          });
        }

        setItemsInCart(newInCart);
        setItemQuantities(newQuantities);
      }
    } catch (err) {
      console.error("Error parsing cart data:", err);
    }
  }, [menuItems.length]); // Only depend on menuItems.length, not the entire array or itemQuantities

  // Setup storage event listener and initial cart state
  useEffect(() => {
    if (menuItems.length === 0) return;

    // Initial update
    updateCartState();

    // Set up event listener for storage changes
    window.addEventListener("storage", updateCartState);

    return () => {
      window.removeEventListener("storage", updateCartState);
    };
  }, [menuItems.length, updateCartState]); // Only depend on menuItems.length, not the entire array

  // Fetch menu items
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/public/foodcourt/${foodcourtId}/menu`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch menu items");
        }

        const data = await response.json();
        setFoodcourt(data.foodcourt);
        setMenuItems(data.menuItems);
        setFilteredMenuItems(data.menuItems);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load menu items",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (foodcourtId) {
      fetchMenuItems();
    }
  }, [foodcourtId]);

  // Filter menu items based on selected category and search query
  useEffect(() => {
    let filtered = [...menuItems];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.categoryId === selectedCategory,
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)),
      );
    }

    setFilteredMenuItems(filtered);
  }, [selectedCategory, menuItems, searchQuery]);

  // Handle quantity change
  const changeQuantity = (itemId: string, change: number) => {
    setItemQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[itemId] || 1) + change);

      // If quantity becomes 0, remove from cart
      if (newQuantity === 0) {
        // Use setTimeout to avoid state updates during render
        setTimeout(() => removeFromCart(itemId), 0);
        return { ...prev, [itemId]: 1 }; // Reset to 1 for next time
      }

      // Otherwise update the cart with new quantity - use setTimeout to avoid state updates during render
      setTimeout(() => updateCartItemQuantity(itemId, newQuantity), 0);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  // Open menu item detail popup
  const openMenuItemPopup = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setSpecialInstructions("");
    setShowPopup(true);
    // Ensure body doesn't scroll when popup is open
    document.body.style.overflow = "hidden";
  };

  // Close menu item detail popup
  const closeMenuItemPopup = () => {
    setShowPopup(false);
    setSelectedMenuItem(null);
    document.body.style.overflow = "auto";
  };

  // Add to cart function
  const addToCart = (
    menuItem: MenuItem,
    quantity: number = 1,
    instructions: string = "",
  ) => {
    if (!foodcourt) return;

    try {
      // Get existing cart or create new one
      const existingCart = localStorage.getItem("cart");
      const cart = existingCart
        ? JSON.parse(existingCart)
        : {
            tableId: tableId,
            items: [],
          };

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item: CartItem) => item.menuItemId === menuItem.id,
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity = quantity;
        if (instructions) {
          cart.items[existingItemIndex].specialInstructions = instructions;
        }
      } else {
        // Add new item to cart
        const cartItem: CartItem = {
          id: `${Date.now()}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: quantity,
          foodcourtId: foodcourt.id,
          foodcourtName: foodcourt.name,
          specialInstructions: instructions || undefined,
        };
        cart.items.push(cartItem);
      }

      // Save cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Manual update of cart count instead of relying on storage event
      const newCartCount = cart.items.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0,
      );
      setCartCount(newCartCount);

      // Update items in cart state manually
      setItemsInCart((prev) => ({
        ...prev,
        [menuItem.id]: true,
      }));

      // Trigger storage event for other components
      window.dispatchEvent(new Event("storage"));

      // Close popup if open
      if (showPopup) {
        closeMenuItemPopup();
      }
    } catch (err) {
      console.error("Error adding item to cart:", err);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    try {
      const existingCart = localStorage.getItem("cart");
      if (!existingCart) return;

      const cart = JSON.parse(existingCart);
      const existingItemIndex = cart.items.findIndex(
        (item: CartItem) => item.menuItemId === menuItemId,
      );

      if (existingItemIndex !== -1) {
        cart.items[existingItemIndex].quantity = quantity;

        // Save cart to localStorage
        localStorage.setItem("cart", JSON.stringify(cart));

        // Manual update of cart count
        const newCartCount = cart.items.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0,
        );
        setCartCount(newCartCount);

        // Trigger storage event for other components
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
    }
  };

  // Remove item from cart
  const removeFromCart = (menuItemId: string) => {
    try {
      const existingCart = localStorage.getItem("cart");
      if (!existingCart) return;

      const cart = JSON.parse(existingCart);
      const updatedItems = cart.items.filter(
        (item: CartItem) => item.menuItemId !== menuItemId,
      );

      cart.items = updatedItems;

      // Save cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Manual update of cart count and items in cart
      const newCartCount = cart.items.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0,
      );
      setCartCount(newCartCount);

      // Update items in cart state manually
      setItemsInCart((prev) => ({
        ...prev,
        [menuItemId]: false,
      }));

      // Trigger storage event for other components
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If foodcourt is closed
  if (foodcourt && foodcourt.status === FoodcourtStatus.TUTUP) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center">
            <Link
              href={`/table/${tableId}`}
              className="mr-4 rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {foodcourt.name}
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-yellow-50 p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              This foodcourt is currently closed
            </h3>
            <p className="text-gray-600">
              Please check back later when the foodcourt is open
            </p>
            <Link
              href={`/table/${tableId}`}
              className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Back to Foodcourts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={`/table/${tableId}`}
                className="mr-3 rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {foodcourt?.name}
                </h1>
                {tableInfo && (
                  <p className="text-sm text-gray-500">
                    Table #{tableInfo.tableNumber}
                  </p>
                )}
              </div>
            </div>
            <Link
              href={`/table/${tableId}/cart`}
              className="relative rounded-full bg-green-50 p-2"
            >
              <ShoppingCart className="h-6 w-6 text-green-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full bg-gray-200 border border-gray-300 py-2 pr-3 pl-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="mau menu apa kamu hari ini.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? "bg-green-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Semua
            </button>
            {Object.entries(CategoryType).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === value
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {categoryLabels[value as CategoryType]}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Menunjukkan {filteredMenuItems.length} dari {menuItems.length} menu
            {selectedCategory && (
              <span>
                {" "}
                untuk {categoryLabels[selectedCategory as CategoryType]}
              </span>
            )}
            {searchQuery.trim() !== "" && (
              <span> matching "{searchQuery.trim()}"</span>
            )}
          </p>
        </div>

        {/* Menu Items Grid */}
        {filteredMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredMenuItems.map((menuItem) => (
              <div
                key={menuItem.id}
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <div
                  className="relative h-48 cursor-pointer"
                  onClick={() => openMenuItemPopup(menuItem)}
                >
                  {menuItem.image ? (
                    <Image
                      src={menuItem.image}
                      alt={menuItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3
                    className="mb-1 cursor-pointer text-xl font-semibold text-back"
                    onClick={() => openMenuItemPopup(menuItem)}
                  >
                    {menuItem.name}
                  </h3>
                  <p
                    className="mb-3 line-clamp-2 cursor-pointer text-sm text-gray-600"
                    onClick={() => openMenuItemPopup(menuItem)}
                  >
                    {menuItem.description || "No description available"}
                  </p>
                 <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gren-600">
                    Rp {Number(menuItem.price).toLocaleString('id-ID')}
                  </span>


                    {/* Add to Cart or Quantity Controls */}
                    {itemsInCart[menuItem.id] ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center rounded-md border border-gray-300">
                          <button
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              // This is in an event handler, so it's safe
                              changeQuantity(menuItem.id, -1);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2">
                            {itemQuantities[menuItem.id] || 1}
                          </span>
                          <button
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              // This is in an event handler, so it's safe
                              changeQuantity(menuItem.id, 1);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="rounded-md bg-green-600 px-3 py-1 text-white transition-colors hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          // This is in an event handler, so it's safe
                          addToCart(menuItem);
                        }}
                        disabled={!menuItem.isAvailable}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              Tidak bisa menemukan menu :(
            </h3>
            <p className="text-gray-500">
              Coba dengan filter lain
            </p>
          </div>
        )}
      </div>

      {/* Footer with cart navigation button
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 z-30 w-full bg-white p-4 shadow-md">
          <div className="mx-auto max-w-7xl">
            <Link
              href={`/table/${tableId}/cart`}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              View Cart ({cartCount} items)
            </Link>
          </div>
        </div>
      )} */}

      {/* Menu Item Detail Popup */}
      {showPopup && selectedMenuItem && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-end bg-black"
          onClick={closeMenuItemPopup}
        >
          <div
            className="animate-slide-up w-full rounded-t-xl bg-white p-4 transition-transform duration-300"
            style={{ maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="mb-2 flex justify-end">
              <button
                onClick={closeMenuItemPopup}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Item image */}
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg">
              {selectedMenuItem.image ? (
                <Image
                  src={selectedMenuItem.image}
                  alt={selectedMenuItem.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Item details */}
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {selectedMenuItem.name}
            </h2>
            <p className="mb-4 text-xl font-bold text-blue-600">
              ${selectedMenuItem.price}
            </p>

            <div className="mb-6">
              <h3 className="mb-2 text-lg font-medium text-gray-800">
                Description
              </h3>
              <p className="text-gray-600">
                {selectedMenuItem.description ||
                  "No description available for this menu item."}
              </p>
            </div>

            {/* Quantity selector - only show if item is in cart */}
            {itemsInCart[selectedMenuItem.id] ? (
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-medium text-gray-800">
                  Quantity
                </h3>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      // This is in an event handler, so it's safe
                      changeQuantity(selectedMenuItem.id, -1);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex h-10 w-14 items-center justify-center border border-gray-300 bg-white">
                    <span className="text-gray-800">
                      {itemQuantities[selectedMenuItem.id] || 1}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      // This is in an event handler, so it's safe
                      changeQuantity(selectedMenuItem.id, 1);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Special instructions */}
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-medium text-gray-800">
                Special Instructions
              </h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or allergies?"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>

            {/* Add to cart button */}
            {itemsInCart[selectedMenuItem.id] ? (
              <button
                onClick={() => {
                  // Use a regular function call in an event handler - this is safe
                  updateCartItemQuantity(
                    selectedMenuItem.id,
                    itemQuantities[selectedMenuItem.id] || 1,
                  );
                }}
                disabled={!selectedMenuItem.isAvailable}
                className={`mb-6 flex w-full items-center justify-center rounded-md py-3 font-medium text-white ${
                  selectedMenuItem.isAvailable
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {selectedMenuItem.isAvailable
                  ? `Update Cart - ${(selectedMenuItem.price * (itemQuantities[selectedMenuItem.id] || 1)).toFixed(2)}`
                  : "Item Not Available"}
              </button>
            ) : (
              <button
                onClick={() => {
                  // Use a regular function call in an event handler - this is safe
                  if (foodcourt) {
                    addToCart(selectedMenuItem, 1, specialInstructions);
                  }
                }}
                disabled={!selectedMenuItem.isAvailable}
                className={`mb-6 flex w-full items-center justify-center rounded-md py-3 font-medium text-white ${
                  selectedMenuItem.isAvailable
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {selectedMenuItem.isAvailable
                  ? `Add to Cart - ${selectedMenuItem.price.toFixed(2)}`
                  : "Item Not Available"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

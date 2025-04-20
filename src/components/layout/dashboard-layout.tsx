// ~/components/layout/dashboard-layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "~/types/shared-types"; // Assuming you've created this
import {
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isOwner = user?.role === UserRole.FOODCOURT_OWNER;

  // Define navigation items based on user role
  const navigationItems = [
    {
      name: "Dashboard",
      href: isAdmin ? "/admin" : "/owner",
      icon: LayoutDashboard,
      current: pathname === (isAdmin ? "/admin" : "/owner"),
    },
  ];

  if (isAdmin) {
    navigationItems.push(
      {
        name: "Foodcourts",
        href: "/admin/foodcourts",
        icon: Store,
        current:
          pathname === "/admin/foodcourts" ||
          pathname.startsWith("/admin/foodcourts/"),
      },
      {
        name: "Owners",
        href: "/admin/owners",
        icon: Users,
        current: pathname === "/admin/owners",
      },
    );
  }

  if (isOwner) {
    navigationItems.push(
      {
        name: "Orders",
        href: "/owner/orders",
        icon: ShoppingCart,
        current:
          pathname === "/owner/orders" || pathname.startsWith("/owner/orders/"),
      },
      {
        name: "My Stalls",
        href: "/owner/stalls",
        icon: Store,
        current:
          pathname === "/owner/stalls" || pathname.startsWith("/owner/stalls/"),
      },
    );
  }

  // Add settings for both roles
  navigationItems.push({
    name: "Settings",
    href: isAdmin ? "/admin/settings" : "/owner/settings",
    icon: Settings,
    current: pathname === (isAdmin ? "/admin/settings" : "/owner/settings"),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between border-b bg-white p-4 lg:hidden">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> FoodCourt
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center text-lg font-bold">
              <span className="mr-2">🍽️</span> FoodCourt
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  item.current
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    item.current ? "text-blue-500" : "text-gray-500",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="flex items-center">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="mr-2 h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="mr-2 h-5 w-5 text-gray-500" />
                    )}
                    <div className="mr-2 text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={isAdmin ? "/admin/profile" : "/owner/profile"}>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={isAdmin ? "/admin/settings" : "/owner/settings"}>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "pt-0 lg:pt-0 lg:pl-64",
          isSidebarOpen ? "pl-64" : "pl-0",
          "transition-all duration-200",
        )}
      >
        <div className="pt-16 lg:pt-0">
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

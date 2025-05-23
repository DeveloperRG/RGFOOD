"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "~/lib/shared-types";
import {
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Settings,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  FileText,
  Utensils,
  Table,
  BarChart,
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

interface DashboardNavProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    id?: string | null;
  };
}

type NavItem =
    | {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
}
    | {
  name: string;
  icon: React.ComponentType<any>;
  children: {
    name: string;
    href: string;
    current: boolean;
  }[];
};

export function DashboardNav({ children, user }: DashboardNavProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isOwner = user?.role === UserRole.OWNER;
  const userId = user?.id || "";

  const navigationItems: NavItem[] = [
    {
      name: "Dashboard",
      href: isAdmin ? "/admin" : `/owner/${userId}`,
      icon: LayoutDashboard,
      current: isAdmin
          ? pathname === "/admin"
          : pathname === `/owner/${userId}`,
    },
  ];

  if (isAdmin) {
    navigationItems.push(
        {
          name: "Stand",
          href: "/admin/foodcourts",
          icon: Store,
          current:
              pathname === "/admin/foodcourts" ||
              pathname.startsWith("/admin/foodcourts/"),
        },
        {
          name: "Pemilik",
          href: "/admin/owners",
          icon: Users,
          current:
              pathname === "/admin/owners" || pathname.startsWith("/admin/owners/"),
        },
        {
          name: "Pengaturan",
          icon: Settings,
          children: [
            {
              name: "Bulk Permissions",
              href: "/admin/settings/permissions/bulk",
              current: pathname === "/admin/settings/permissions/bulk",
            },
            {
              name: "Default Permissions",
              href: "/admin/settings/permissions/defaults",
              current: pathname === "/admin/settings/permissions/defaults",
            },
            {
              name: "Permission Templates",
              href: "/admin/settings/permissions/templates",
              current: pathname === "/admin/settings/permissions/templates",
            },
          ],
        },
        {
          name: "Meja",
          href: "/admin/tables",
          icon: Table,
          current:
              pathname === "/admin/tables" || pathname.startsWith("/admin/tables/"),
        },

    );
  }

  if (isOwner) {
    navigationItems.push(
        {
          name: "Foodcourt",
          href: `/owner/${userId}/foodcourt`,
          icon: Store,
          current: pathname === `/owner/${userId}/foodcourt`,
        },
        {
          name: "Menu",
          href: `/owner/${userId}/foodcourt/menu`,
          icon: Utensils,
          current:
              pathname === `/owner/${userId}/foodcourt/menu` ||
              pathname.startsWith(`/owner/${userId}/foodcourt/menu/`),
        },
        {
          name: "Orders",
          href: `/owner/${userId}/foodcourt/orders`,
          icon: ShoppingCart,
          current:
              pathname === `/owner/${userId}/foodcourt/orders` ||
              pathname.startsWith(`/owner/${userId}/foodcourt/orders/`),
        },
        {
          name: "Statistics",
          href: `/owner/${userId}/stats`,
          icon: BarChart,
          current: pathname === `/owner/${userId}/stats`,
        },
    );
  }

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
                <span className="mr-2">🍽️</span> Stand
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navigationItems.map((item) =>
                  "children" in item ? (
                      <div key={item.name}>
                        <button
                            type="button"
                            className={cn(
                                "flex w-full items-center px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-md",
                                openDropdown === item.name && "bg-gray-100"
                            )}
                            onClick={() =>
                                setOpenDropdown(openDropdown === item.name ? null : item.name)
                            }
                        >
                          <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {item.name}
                          {openDropdown === item.name ? (
                              <ChevronUp className="ml-auto h-4 w-4" />
                          ) : (
                              <ChevronDown className="ml-auto h-4 w-4" />
                          )}
                        </button>
                        {openDropdown === item.name && (
                            <div className="ml-8 space-y-1">
                              {item.children.map((child) => (
                                  <Link
                                      key={child.name}
                                      href={child.href}
                                      className={cn(
                                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                                          child.current
                                              ? "bg-blue-50 text-blue-700"
                                              : "text-gray-700 hover:bg-gray-100",
                                      )}
                                  >
                                    {child.name}
                                  </Link>
                              ))}
                            </div>
                        )}
                      </div>
                  ) : (
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
                  )
              )}
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
                    <Link
                        href={
                          isAdmin ? "/admin/profile" : `/owner/${userId}/profile`
                        }
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                        href={
                          isAdmin ? "/admin/settings" : `/owner/${userId}/settings`
                        }
                    >
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
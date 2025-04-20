// src/components/layout/public-navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // In a real application, this would come from a cart context
  useEffect(() => {
    // For demo purposes, set a dummy cart count
    setCartCount(3);
  }, []);

  // Add scroll effect for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          FoodCourt Hub
        </Link>

        <div className="flex items-center space-x-4">
          {/* Table link if inside table context
          {pathname.includes("/table/") && !pathname.includes("/cart") && (
            <Link
              href={pathname.split("/foodcourt")[0]}
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              All Foodcourts
            </Link>
          )} */}

          {/* Cart icon */}
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-colors ${
                pathname === "/cart"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs leading-none font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FoodcourtCardGrid } from "~/components/dashboard/admin/foodcourts/foodcourt-CardGrid";
import "~/styles/globals.css";



const STATUS_FILTER = {
  ALL: "all",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export default function FoodcourtsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTER)[keyof typeof STATUS_FILTER]>("all");
  const [filteredCount, setFilteredCount] = useState(0);

  const indicatorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = {
    all: useRef<HTMLButtonElement>(null),
    active: useRef<HTMLButtonElement>(null),
    inactive: useRef<HTMLButtonElement>(null),
  };

  useEffect(() => {
    const currentButton = buttonRefs[statusFilter]?.current;
    const indicator = indicatorRef.current;

    if (currentButton && indicator) {
      const { offsetLeft, offsetWidth } = currentButton;
      indicator.style.transform = `translateX(${offsetLeft}px)`;
      indicator.style.width = `${offsetWidth}px`;
    }
  }, [statusFilter]);

  return (
    <div className="custom-scrollbar container mx-auto overflow-auto py-0">
      {/* Bagian Judul dan Filter */}
      <div className="mb-4">
        {/* Judul */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Stand</h1>
          <p className="text-muted-foreground">
            Kelola semua Stand Dalam Sistem
          </p>
        </div>

        {/* Pencarian dan Tambah */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            type="search"
            placeholder="Cari Stand..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="group relative w-full rounded-xl border border-purple-300 p-2 transition-all duration-900 ease-in-out hover:border-transparent hover:ring-2 hover:ring-purple-500 focus:ring-2 focus:ring-red-500 sm:max-w-sm"
          />
          <Link href="/admin/foodcourts/new">
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambahkan Stand
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs + Counter */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex w-fit items-center gap-1 rounded-lg bg-blue-50 p-0.5">
          <div
            ref={indicatorRef}
            className="absolute top-1 bottom-1 left-0 rounded-md bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ zIndex: 0 }}
          />

          {Object.entries(STATUS_FILTER).map(([key, value]) => (
            <button
              key={value}
              ref={buttonRefs[value]}
              onClick={() => setStatusFilter(value)}
              className={`relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                statusFilter === value
                  ? "text-white"
                  : "text-blue-500 hover:text-blue-500"
              }`}
            >
              {value === "all"
                ? "Semua"
                : value === "active"
                  ? "Aktif"
                  : "Tidak Aktif"}
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="rounded-md bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm ring-1 ring-purple-200 ring-inset">
          {filteredCount} Stand
        </div>
      </div>

      {/* Grid Cards */}
      <FoodcourtCardGrid
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onCountChange={setFilteredCount}
      />
    </div>
  );
}

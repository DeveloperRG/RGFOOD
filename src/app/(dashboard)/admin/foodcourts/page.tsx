// ~/src/app/(dashboard)/admin/foodcourts/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FoodcourtCardGrid } from "~/components/dashboard/admin/foodcourts/foodcourt-CardGrid";

// This is a client component, so metadata needs to be exported from a separate file
// or use a layout.tsx file to add metadata
export default function FoodcourtsPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Foodcourts</h1>
            <p className="text-muted-foreground">
              Manage all foodcourts in the system
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search foodcourts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:w-[250px]"
        />
        <Link href="/admin/foodcourts/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Foodcourt
          </Button>
        </Link>
      </div>

      <FoodcourtCardGrid query={query} onQueryChange={setQuery} />
    </div>
  );
}
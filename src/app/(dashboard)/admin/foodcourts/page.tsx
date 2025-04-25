"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FoodcourtCardGrid } from "~/components/dashboard/admin/foodcourts/components/foodcourt-CardGrid";

export default function FoodcourtsPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foodcourts</h1>
          <p className="text-muted-foreground">
            Manage all foodcourts in the system
          </p>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
          <Input
            type="search"
            placeholder="Search foodcourt..."
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
      </div>

      <FoodcourtCardGrid query={query} onQueryChange={setQuery} />
    </div>
  );
}

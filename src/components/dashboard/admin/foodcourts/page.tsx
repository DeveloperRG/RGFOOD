"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { FoodcourtCardGrid } from "~/components/dashboard/admin/foodcourts/components/foodcourt-CardGrid";

export default function FoodcourtPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full max-w-sm flex-1">
          <input
            type="text"
            placeholder="Search foodcourt…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="focus:ring-primary w-full rounded-md border px-4 py-2 shadow-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <Button className="ml-auto">+ Add New Foodcourt</Button>
      </div>

      <FoodcourtCardGrid query={query} onQueryChange={setQuery} />
    </div>
  );
}

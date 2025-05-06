// ~components/dashboard/admin/tables/edit-table-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

interface EditTableFormProps {
  table: {
    id: string;
    tableNumber: string;
    capacity: number;
    isAvailable: boolean;
  };
}

export default function EditTableForm({ table }: EditTableFormProps) {
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState(table.tableNumber);
  const [capacity, setCapacity] = useState(table.capacity);
  const [isAvailable, setIsAvailable] = useState(table.isAvailable);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/tables/${table.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber, capacity, isAvailable }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update table");
      }

      toast.success("Table updated successfully");
      router.push("/admin/tables");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableLink = `https://foodcourt.com/table/${table.id}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Table Number</label>
        <Input
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Capacity</label>
        <Input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Availability</label>
        <select
          value={isAvailable ? "true" : "false"}
          onChange={(e) => setIsAvailable(e.target.value === "true")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Table"}
      </Button>

      {/* Tombol Tambahan */}

    </form>
  );
}

// ~/src/app/(dashboard)/admin/foodcourts/[id]/assign/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Define types for our data
interface Owner {
  id: string;
  name: string | null;
  email: string | null;
  createdAt?: string;
}

interface Foodcourt {
  id: string;
  name: string;
  owner?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export default function AssignOwnerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [foodcourt, setFoodcourt] = useState<Foodcourt | null>(null);
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch foodcourt details and available owners
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch foodcourt details
        const foodcourtResponse = await fetch(`/api/admin/foodcourts/${id}`);
        if (!foodcourtResponse.ok) {
          throw new Error("Failed to fetch foodcourt details");
        }
        const foodcourtData = await foodcourtResponse.json();
        setFoodcourt(foodcourtData);

        // Fetch available owners
        const ownersResponse = await fetch(
          `/api/admin/foodcourts/available-owners`,
        );
        if (!ownersResponse.ok) {
          throw new Error("Failed to fetch available owners");
        }
        const ownersData = await ownersResponse.json();
        setAvailableOwners(ownersData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOwnerId) {
      toast.error("Please select an owner");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/admin/foodcourts/${id}/assign-owner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerId: selectedOwnerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign owner");
      }

      toast.success("Owner assigned successfully");
      router.push(`/admin/foodcourts/${id}`);
    } catch (err) {
      console.error("Error assigning owner:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to assign owner",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto flex h-[50vh] items-center justify-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href={`/admin/foodcourts/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Foodcourt Details
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-xl font-bold text-red-800">Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  // Check if foodcourt already has an owner
  const isSystemUser = foodcourt?.owner?.email === "system@foodcourt.internal";
  const hasRealOwner = !!foodcourt?.owner && !isSystemUser;

  if (hasRealOwner) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href={`/admin/foodcourts/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Foodcourt Details
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-2 text-xl font-bold text-yellow-800">
            Owner Already Assigned
          </h2>
          <p className="text-yellow-800">
            This foodcourt already has an owner assigned (
            {foodcourt.owner?.name || foodcourt.owner?.email}). To change the
            owner, you need to unassign the current owner first.
          </p>
          <div className="mt-4">
            <Link href={`/admin/foodcourts/${id}`}>
              <Button variant="outline">Back to Foodcourt Details</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/foodcourts/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Foodcourt Details
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assign Owner</h1>
        <p className="text-muted-foreground">
          Assign an owner to {foodcourt?.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ownerId" className="mb-1 block text-sm font-medium">
            Select Owner
          </label>
          <select
            id="ownerId"
            className="w-full rounded-md border p-2"
            value={selectedOwnerId}
            onChange={(e) => setSelectedOwnerId(e.target.value)}
            required
          >
            <option value="">-- Choose Owner --</option>
            {availableOwners.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Owner"
          )}
        </Button>
      </form>
    </div>
  );
}

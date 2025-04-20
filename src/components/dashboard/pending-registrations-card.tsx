// ~/components/dashboard/pending-registrations-card.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { UserPlus } from "lucide-react";
import { Badge } from "~/components/ui/badge";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
};

interface PendingRegistrationsCardProps {
  pendingRegistrations: User[];
}

export function PendingRegistrationsCard({
  pendingRegistrations,
}: PendingRegistrationsCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pending Registrations</CardTitle>
          <CardDescription>
            Owners who need to be assigned to a foodcourt
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="border-yellow-200 bg-yellow-50 text-yellow-700"
        >
          {pendingRegistrations.length} Pending
        </Badge>
      </CardHeader>
      <CardContent>
        {pendingRegistrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No pending registrations at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingRegistrations.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name || "Unnamed User"}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <p className="text-muted-foreground text-xs">
                    Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/owners/${user.id}/assign`)}
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/admin/owners">
            <UserPlus className="mr-2 h-4 w-4" />
            View All Owners
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

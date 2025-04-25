"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

type Foodcourt = {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  imageUrl?: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function FoodcourtCardGrid({ query, onQueryChange }: Props) {
  const [filteredFoodcourts, setFilteredFoodcourts] = useState<Foodcourt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Foodcourt | null>(null);

  const handleDelete = () => {
    if (!selected) return;
    toast.success(`Foodcourt "${selected.name}" telah dihapus.`);
    setSelected(null);
  };

  const handleSearch = async (value: string) => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/foodcourt/search?q=${encodeURIComponent(value)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      if (data.length === 0) {
        toast.info("Foodcourt tidak ada.");
      }

      setFilteredFoodcourts(data);
    } catch (error) {
      toast.error("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(query);
  }, [query]);

  return (
    <>
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filteredFoodcourts.map((fc) => {
          const cardContent = (
            <Card className="cursor-pointer overflow-hidden transition hover:shadow-md">
              {fc.imageUrl ? (
                <Image
                  src={fc.imageUrl}
                  alt={fc.name}
                  width={400}
                  height={200}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400">
                  No Image
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="text-muted-foreground w-full space-y-2 text-sm">
                    <h3 className="text-lg font-semibold text-black">
                      {fc.name}
                    </h3>
                    <div className="grid grid-cols-[52px_1fr] gap-x-2 text-sm text-gray-700">
                      <div className="font-semibold">Address</div>
                      <div className="truncate">: {fc.address}</div>

                      <div className="font-semibold">Owner</div>
                      <div>: {fc.owner?.name ?? "Not assigned"}</div>

                      <div className="font-semibold">Status</div>
                      <div className="flex items-center gap-1">
                        :{" "}
                        <Badge
                          className={
                            fc.isActive ? "bg-green-100 text-green-600" : ""
                          }
                          variant={fc.isActive ? "default" : "destructive"}
                        >
                          {fc.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full p-2 hover:bg-gray-100"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/foodcourts/${fc.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelected(fc);
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );

          return (
            <Link key={fc.id} href={`/admin/foodcourts/${fc.id}`}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Yakin ingin menghapus{" "}
              <span className="font-bold">{selected?.name}</span>?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

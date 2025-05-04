"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Edit, Trash2, QrCode, Loader2, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import AddTableForm from "~/components/dashboard/admin/tables/add-table-form";

// Define interface for table data from API
interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  qrCode: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  activeSession: {
    id: string;
    sessionStart: string;
  } | null;
}

interface TablesResponse {
  tables: Table[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const router = useRouter();

  // Fetch tables from API
  const fetchTables = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append("tableNumber", searchQuery);
      if (availabilityFilter) params.append("isAvailable", availabilityFilter);

      const response = await fetch(`/api/admin/tables?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }

      const data: TablesResponse = await response.json();
      setTables(data.tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  // Load tables on component mount and when filters change
  useEffect(() => {
    fetchTables();
  }, [searchQuery, availabilityFilter]);

  // Toggle expanded row for mobile view
  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // View QR code for a table
  const viewQrCode = (tableId: string) => {
    router.push(`/admin/tables/${tableId}/qrcode`);
  };

  // Handle dialog close and refresh data
  const handleDialogClose = () => {
    setShowAddDialog(false);
    fetchTables(); // Refresh the table list
  };

  // Delete table handler
  const handleDelete = async () => {
    if (!selectedTable) return;
    setDeleteLoadingId(selectedTable.id);
    try {
      const res = await fetch(`/api/admin/tables/${selectedTable.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete table");
      } else {
        toast.success("Table deleted successfully");
        fetchTables();
        setDeleteDialogOpen(false);
        setSelectedTable(null);
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
            <p className="text-muted-foreground">
              Manage all tables in the system
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
                <DialogDescription>
                  Create a new table with a unique table number and QR code
                </DialogDescription>
              </DialogHeader>
              <AddTableForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Search by table number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-[250px]"
          />
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="">All Tables</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden overflow-hidden rounded-lg border bg-white shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No tables found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">
                        {table.tableNumber}
                      </TableCell>
                      <TableCell>{table.capacity}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${table.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {table.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewQrCode(table.id)}
                        >
                          <QrCode className="mr-2 h-3 w-3" />
                          View QR
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/tables/${table.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={deleteDialogOpen && selectedTable?.id === table.id}
                            onOpenChange={(open) => {
                              setDeleteDialogOpen(open);
                              if (!open) setSelectedTable(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedTable(table);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Delete Table "{table.tableNumber}"?
                                </DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. Are you sure you want to delete table <b>{table.tableNumber}</b>?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setSelectedTable(null);
                                  }}
                                  disabled={deleteLoadingId === table.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDelete}
                                  disabled={deleteLoadingId === table.id}
                                >
                                  {deleteLoadingId === table.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                  )}
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="space-y-4 md:hidden">
            {tables.length === 0 ? (
              <div className="rounded-lg border bg-white p-6 text-center">
                No tables found.
              </div>
            ) : (
              tables.map((table) => (
                <div
                  key={table.id}
                  className="overflow-hidden rounded-lg border bg-white shadow-sm"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => toggleRow(table.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="font-medium">{table.tableNumber}</div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${table.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {table.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <svg
                      className={`h-5 w-5 transition-transform ${expandedRow === table.id ? "rotate-180 transform" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {expandedRow === table.id && (
                    <div className="border-t border-gray-100 p-4">
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="text-xs text-gray-500">Capacity</div>
                        <div className="text-sm">{table.capacity}</div>

                        <div className="text-xs text-gray-500">Status</div>
                        <div className="text-sm">
                          {table.isAvailable ? "Available" : "Unavailable"}
                        </div>

                        <div className="text-xs text-gray-500">Created</div>
                        <div className="text-sm">
                          {new Date(table.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewQrCode(table.id)}
                          className="w-full"
                        >
                          <QrCode className="mr-2 h-3 w-3" />
                          View QR Code
                        </Button>

                        <div className="flex justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/admin/tables/${table.id}/edit`)
                            }
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Dialog
                            open={deleteDialogOpen && selectedTable?.id === table.id}
                            onOpenChange={(open) => {
                              setDeleteDialogOpen(open);
                              if (!open) setSelectedTable(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-destructive"
                                onClick={() => {
                                  setSelectedTable(table);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Delete Table "{table.tableNumber}"?
                                </DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. Are you sure you want to delete table <b>{table.tableNumber}</b>?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setSelectedTable(null);
                                  }}
                                  disabled={deleteLoadingId === table.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDelete}
                                  disabled={deleteLoadingId === table.id}
                                >
                                  {deleteLoadingId === table.id ? (
                                    <Loader2 className="mr-2 h-3 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="mr-2 h-3 w-4" />
                                  )}
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

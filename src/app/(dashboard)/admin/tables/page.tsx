"use client";

import { useState } from "react";

// Mendefinisikan interface untuk objek tabel
interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
}

function App() {
  // Mendefinisikan tipe untuk state expandedRow
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const tables: Table[] = [
    { id: "1", number: "A01", capacity: 4, status: "active" },
    { id: "2", number: "A02", capacity: 2, status: "active" },
    { id: "3", number: "B01", capacity: 6, status: "inactive" },
  ];

  // State untuk menampilkan detail meja pada tampilan mobile
  // Tipe sudah didefinisikan di atas

  // Toggle expanded row untuk tampilan mobile
  const toggleRow = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-0 md:text-3xl">
            Daftar Meja
          </h1>
          <button className="w-full rounded-md bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700 sm:w-auto">
            Tambah Meja
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Cari meja..."
            className="w-full flex-1 rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:w-auto">
            <option value="">Filter</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Desktop View - Tabel tradisional */}
        <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-sm font-medium text-black">
                  Nomor Meja
                </th>
                <th className="px-6 py-3 text-sm font-medium text-black">
                  Kapasitas
                </th>
                <th className="px-6 py-3 text-sm font-medium text-black">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-medium text-black">
                  QR Code
                </th>
                <th className="px-6 py-3 text-sm font-medium text-black">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {table.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {table.capacity}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm ${
                        table.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {table.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="h-8 w-8 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button className="rounded bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button className="rounded bg-orange-100 p-1.5 text-orange-600 hover:bg-orange-200">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <button className="rounded bg-red-100 p-1.5 text-red-600 hover:bg-red-200">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing 1-3 of 3 entries
            </div>
          </div>
        </div>

        {/* Mobile View - Card List */}
        <div className="space-y-4 md:hidden">
          {tables.map((table) => (
            <div
              key={table.id}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3"
                onClick={() => toggleRow(table.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="font-medium">{table.number}</div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                      table.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {table.status === "active" ? "Active" : "Inactive"}
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
                <div className="border-t border-gray-100 px-4 py-3">
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="text-xs text-gray-500">Kapasitas</div>
                    <div className="text-sm">{table.capacity}</div>

                    <div className="text-xs text-gray-500">QR Code</div>
                    <div className="h-8 w-8 rounded bg-gray-200"></div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button className="rounded bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button className="rounded bg-orange-100 p-1.5 text-orange-600 hover:bg-orange-200">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button className="rounded bg-red-100 p-1.5 text-red-600 hover:bg-red-200">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="py-3 text-sm text-gray-500">
            Showing 1-3 of 3 entries
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

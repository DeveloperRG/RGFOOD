"use client";

import React, { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Menu,
  Eye,
  RefreshCw,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  foodcourts: string[];
  joined: string;
  settings: {
    canEditMenu: boolean;
    canViewOrder: boolean;
    canUpdateOrder: boolean;
  };
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    verified: true,
    foodcourts: ["Downtown Plaza", "East Side Mall", "Central Station"],
    joined: "2023-05-12T09:30:00Z",
    settings: {
      canEditMenu: true,
      canViewOrder: true,
      canUpdateOrder: false,
    },
  },
  {
    id: "2",
    name: "Jamie Chen",
    email: "jamie.chen@example.com",
    verified: true,
    foodcourts: ["West Avenue", "Riverside Center"],
    joined: "2023-08-24T14:15:00Z",
    settings: {
      canEditMenu: true,
      canViewOrder: true,
      canUpdateOrder: true,
    },
  },
  {
    id: "3",
    name: "Taylor Rodriguez",
    email: "taylor.rodriguez@example.com",
    verified: false,
    foodcourts: ["North Square"],
    joined: "2024-01-07T11:45:00Z",
    settings: {
      canEditMenu: false,
      canViewOrder: true,
      canUpdateOrder: false,
    },
  },
  {
    id: "4",
    name: "Jordan Smith",
    email: "jordan.smith@example.com",
    verified: true,
    foodcourts: ["Marina Bay", "South Point", "Mountain View"],
    joined: "2022-11-18T16:20:00Z",
    settings: {
      canEditMenu: true,
      canViewOrder: true,
      canUpdateOrder: true,
    },
  },
  {
    id: "5",
    name: "Casey Johnson",
    email: "casey.johnson@example.com",
    verified: false,
    foodcourts: [],
    joined: "2024-03-02T10:10:00Z",
    settings: {
      canEditMenu: false,
      canViewOrder: false,
      canUpdateOrder: false,
    },
  },
];

const Page: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const togglePermission = (
    userId: string,
    permission: keyof User["settings"],
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            settings: {
              ...user.settings,
              [permission]: !user.settings[permission],
            },
          };
        }
        return user;
      }),
    );
  };

  const handleBulkPermissionToggle = (permission: keyof User["settings"]) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (selectedUsers.includes(user.id)) {
          return {
            ...user,
            settings: {
              ...user.settings,
              [permission]: !user.settings[permission],
            },
          };
        }
        return user;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-indigo-600 p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl leading-tight font-bold text-gray-900">
                Manage Permissions
              </h1>
            </div>
            <div>
              <span className="text-sm text-gray-500">
                {selectedUsers.length} of {users.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="ml-4 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                {selectedUsers.length === users.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Review and manage user permissions across your organization
          </p>
        </header>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`overflow-hidden rounded-lg border transition-all duration-200 ${selectedUsers.includes(user.id) ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:bg-gray-50"} shadow-sm hover:shadow`}
            >
              <div className="p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="h-5 w-5 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <h3 className="mr-2 text-lg font-medium text-gray-900">
                          {user.name}
                        </h3>
                        {user.verified ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{user.email}</p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                          <span>
                            {user.foodcourts.length > 0
                              ? `${user.foodcourts.length} foodcourt${user.foodcourts.length > 1 ? "s" : ""}`
                              : "No foodcourts"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                          <span>Joined {formatDate(user.joined)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:ml-6">
                    {user.foodcourts.map((court, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {court}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 border-t pt-4 sm:flex-row">
                  <label className="flex flex-1 items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Menu className="mr-2 h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Edit Menu
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Allows user to modify menu items and prices
                      </p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${user.settings.canEditMenu ? "bg-indigo-600" : "bg-gray-200"}`}
                      onClick={() => togglePermission(user.id, "canEditMenu")}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${user.settings.canEditMenu ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </div>
                  </label>

                  <label className="flex flex-1 items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Eye className="mr-2 h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          View Order
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Can view incoming and historical orders
                      </p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${user.settings.canViewOrder ? "bg-indigo-600" : "bg-gray-200"}`}
                      onClick={() => togglePermission(user.id, "canViewOrder")}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${user.settings.canViewOrder ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </div>
                  </label>

                  <label className="flex flex-1 items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <RefreshCw className="mr-2 h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Update Order
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Ability to modify order status and details
                      </p>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${user.settings.canUpdateOrder ? "bg-indigo-600" : "bg-gray-200"}`}
                      onClick={() =>
                        togglePermission(user.id, "canUpdateOrder")
                      }
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${user.settings.canUpdateOrder ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;

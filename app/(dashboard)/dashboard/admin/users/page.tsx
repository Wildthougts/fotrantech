"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiUserPlus, FiUserMinus, FiRefreshCw } from "react-icons/fi";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

interface PaginatedResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

async function fetchUsers(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse> {
  const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

async function toggleAdminStatus(userId: string, isCurrentlyAdmin: boolean) {
  const response = await fetch(
    `/api/admin/users${isCurrentlyAdmin ? `?id=${userId}` : ""}`,
    {
      method: isCurrentlyAdmin ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: isCurrentlyAdmin ? undefined : JSON.stringify({ userId }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `Failed to ${isCurrentlyAdmin ? "remove" : "add"} admin`
    );
  }

  return response.json();
}

async function downloadUsersCSV() {
  const response = await fetch("/api/admin/users?format=csv");
  if (!response.ok) throw new Error("Failed to download users");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const queryClient = useQueryClient();

  // Query for fetching users with caching
  const { data, isLoading, refetch } = useQuery<PaginatedResponse>({
    queryKey: ["users", currentPage, itemsPerPage],
    queryFn: () => fetchUsers(currentPage, itemsPerPage),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // This replaces keepPreviousData
  });

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  // Mutation for toggling admin status
  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      toggleAdminStatus(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Admin status updated successfully");
    },
    onError: (error: Error) => {
      console.error("Error toggling admin status:", error);
      toast.error("Failed to update admin status");
    },
  });

  const handleToggleAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin: isCurrentlyAdmin });
  };

  const handleDownloadCSV = async () => {
    try {
      await downloadUsersCSV();
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download users");
    }
  };

  if (isLoading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <div className="flex gap-4">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Download CSV
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Table for larger screens */}
      <div className="hidden sm:block bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                    disabled={toggleAdminMutation.isPending}
                    className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                      user.isAdmin
                        ? "text-red-700 hover:text-red-900"
                        : "text-green-700 hover:text-green-900"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {user.isAdmin ? (
                      <>
                        <FiUserMinus className="w-4 h-4 mr-1" />
                        {toggleAdminMutation.isPending
                          ? "Removing..."
                          : "Remove Admin"}
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 mr-1" />
                        {toggleAdminMutation.isPending
                          ? "Adding..."
                          : "Make Admin"}
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="sm:hidden space-y-4">
        {users.map((user: User) => (
          <div
            key={user.id}
            className="bg-white shadow rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500 mt-1">{user.email}</div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                disabled={toggleAdminMutation.isPending}
                className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                  user.isAdmin
                    ? "text-red-700 hover:text-red-900"
                    : "text-green-700 hover:text-green-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {user.isAdmin ? (
                  <>
                    <FiUserMinus className="w-4 h-4 mr-1" />
                    {toggleAdminMutation.isPending
                      ? "Removing..."
                      : "Remove Admin"}
                  </>
                ) : (
                  <>
                    <FiUserPlus className="w-4 h-4 mr-1" />
                    {toggleAdminMutation.isPending ? "Adding..." : "Make Admin"}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="bg-white shadow rounded-lg p-6 text-center text-sm text-gray-500">
            No users found.
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === i + 1
                      ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

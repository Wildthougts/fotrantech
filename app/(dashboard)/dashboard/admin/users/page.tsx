'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiUserPlus, FiUserMinus, FiRefreshCw } from 'react-icons/fi';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

async function fetchUsers() {
  const response = await fetch('/api/admin/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function toggleAdminStatus(userId: string, isCurrentlyAdmin: boolean) {
  const response = await fetch(
    `/api/admin/users${isCurrentlyAdmin ? `?id=${userId}` : ''}`,
    {
      method: isCurrentlyAdmin ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: isCurrentlyAdmin ? undefined : JSON.stringify({ userId }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to ${isCurrentlyAdmin ? 'remove' : 'add'} admin`);
  }

  return response.json();
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  // Query for fetching users with caching
  const { data: users = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false // Prevent refetch on window focus
  });

  // Mutation for toggling admin status
  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      toggleAdminStatus(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Admin status updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  });

  const handleToggleAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin: isCurrentlyAdmin });
  };

  if (isLoading) {
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
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <FiRefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
            {users.map((user) => (
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
                        ? 'text-red-700 hover:text-red-900'
                        : 'text-green-700 hover:text-green-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {user.isAdmin ? (
                      <>
                        <FiUserMinus className="w-4 h-4 mr-1" />
                        {toggleAdminMutation.isPending ? 'Removing...' : 'Remove Admin'}
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 mr-1" />
                        {toggleAdminMutation.isPending ? 'Adding...' : 'Make Admin'}
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow rounded-lg p-4 space-y-3">
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
                    ? 'text-red-700 hover:text-red-900'
                    : 'text-green-700 hover:text-green-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {user.isAdmin ? (
                  <>
                    <FiUserMinus className="w-4 h-4 mr-1" />
                    {toggleAdminMutation.isPending ? 'Removing...' : 'Remove Admin'}
                  </>
                ) : (
                  <>
                    <FiUserPlus className="w-4 h-4 mr-1" />
                    {toggleAdminMutation.isPending ? 'Adding...' : 'Make Admin'}
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
    </div>
  );
} 
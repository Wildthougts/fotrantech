'use client';

import { useState, useEffect } from 'react';
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
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

      toast.success(`Successfully ${isCurrentlyAdmin ? 'removed' : 'added'} admin role`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error(`Failed to ${isCurrentlyAdmin ? 'remove' : 'add'} admin role`);
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <FiRefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
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
                    className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                      user.isAdmin
                        ? 'text-red-700 hover:text-red-900'
                        : 'text-green-700 hover:text-green-900'
                    }`}
                  >
                    {user.isAdmin ? (
                      <>
                        <FiUserMinus className="w-4 h-4 mr-1" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 mr-1" />
                        Make Admin
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
    </div>
  );
} 
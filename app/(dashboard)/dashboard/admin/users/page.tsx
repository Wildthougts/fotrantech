'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface UserService {
  user_id: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
  }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin');
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

  const handleToggleService = async (userId: string, serviceId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          service_id: serviceId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update service status');
      
      await fetchUsers();
      toast.success('Service status updated');
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  const handleDeleteService = async (userId: string, serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service from the user?')) return;

    try {
      const response = await fetch(`/api/admin?user_id=${userId}&service_id=${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');
      
      await fetchUsers();
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Users</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.user_id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">User ID: {user.user_id}</h3>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Services</h4>
                    <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {user.services.map((service) => (
                        <div
                          key={service.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900">
                              {service.name}
                            </h5>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                service.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {service.description}
                          </p>
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() =>
                                handleToggleService(
                                  user.user_id,
                                  service.id,
                                  service.is_active ? 'active' : 'inactive'
                                )
                              }
                              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {service.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteService(user.user_id, service.id)
                              }
                              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {user.services.length === 0 && (
                        <p className="text-sm text-gray-500 col-span-full">
                          No services found for this user.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {users.length === 0 && (
              <li className="p-6 text-center text-gray-500">
                No users found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 
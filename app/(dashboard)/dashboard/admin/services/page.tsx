'use client';

import { useEffect, useState } from 'react';
import { Service } from '@/utils/services';
import toast from 'react-hot-toast';
import AdminServiceCard from './components/AdminServiceCard';
import AddServiceModal from './components/AddServiceModal';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      await fetchServices();
      setIsAddModalOpen(false);
      toast.success('Service added successfully');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add service');
    }
  };

  const handleToggleStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/services?id=${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!response.ok) throw new Error('Failed to update service');
      
      await fetchServices();
      toast.success('Service status updated');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service status');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/admin/services?id=${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');
      
      await fetchServices();
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Services</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Service
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading services...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <AdminServiceCard
              key={service.id}
              service={service}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteService}
            />
          ))}
          {services.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-12">
              No services found. Add your first service to get started.
            </p>
          )}
        </div>
      )}

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddService}
      />
    </div>
  );
} 
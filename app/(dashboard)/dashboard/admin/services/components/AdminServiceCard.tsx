'use client';

import { Service } from '@/utils/supabase';

interface AdminServiceCardProps {
  service: Service;
  onToggleStatus: (serviceId: string, isActive: boolean) => Promise<void>;
  onDelete: (serviceId: string) => Promise<void>;
}

export default function AdminServiceCard({
  service,
  onToggleStatus,
  onDelete,
}: AdminServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
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
        <p className="mt-2 text-sm text-gray-500">{service.description}</p>
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">${service.price}</span>
          <span className="text-sm text-gray-500">/month</span>
        </div>
        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => onToggleStatus(service.id, service.is_active)}
            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {service.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 
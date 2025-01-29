'use client';

import { useEffect, useState } from 'react';
import { Service } from '@/utils/services';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Available Services</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{service.name}</h2>
                <p className="mt-1 text-lg font-medium text-indigo-600">${service.price}</p>
              </div>
              
              <p className="text-gray-500">{service.description}</p>

              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}

              {service.youtube_url && (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={service.youtube_url}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-md"
                  />
                </div>
              )}

              <button
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => toast.success('This feature is coming soon!')}
              >
                Subscribe
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No services available at the moment.
          </p>
        )}
      </div>
    </div>
  );
} 
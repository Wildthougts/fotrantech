"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Service } from "@/utils/services";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/services", {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure we always get fresh data
      });

      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();

      // Filter out any null entries and soft-deleted services
      const filteredServices = data.filter(
        (service: Service) => service && !service.deleted_at
      );

      setServices(filteredServices);
    } catch (error) {
      toast.error("Error loading services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/admin/services?id=${serviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete service");

      toast.success("Service deleted successfully");
      fetchServices(); // Refresh the list
    } catch (error) {
      toast.error("Error deleting service");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{service.name}</h2>
                <p className="text-gray-600">${service.price}</p>
              </div>
              <button
                onClick={() => deleteService(service.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>

            <p className="text-gray-700 mb-4">{service.description}</p>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Status: {service.is_active ? "Active" : "Inactive"}</span>
              <span>
                Created: {new Date(service.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* {service.image_url && (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-40 object-cover mt-4 rounded"
              />
            )} */}
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No services found. Add some services to get started.
        </div>
      )}
    </div>
  );
}

import { getServices } from '@/utils/supabase';
import ServiceCard from '../dashboard/services/components/ServiceCard';

export const revalidate = 300; // Revalidate page every 5 minutes

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Available Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
        {services.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
} 

import { supabase } from "@/utils/supabase";
import ServiceCard from "./components/ServiceCard";

async function ServicesPage() {
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Available Services</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services?.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
        {(!services || services.length === 0) && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No services available at the moment.
          </p>
        )}
      </div>
    </div>
  );
}

export default ServicesPage; 
import { createClient } from "@supabase/supabase-js";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error("Missing Supabase environment variables");
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Test connection
Promise.resolve(supabase.from("services").select("count", { count: "exact" }))
  .then(({ error }) => {
    if (error) {
      console.error("Supabase connection error:", error);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to Supabase:", err);
  });

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  image_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
};

export type UserService = {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  service_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
};

let servicesCache: Service[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getServices() {
  const now = Date.now();

  // Return cached data if it's still valid
  if (servicesCache && now - lastFetchTime < CACHE_DURATION) {
    return servicesCache;
  }

  // Fetch fresh data
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  // Update cache
  servicesCache = services;
  lastFetchTime = now;

  return services;
}

export async function getAllServices() {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all services:", error);
    throw error;
  }
}

export async function deleteService(serviceId: string) {
  try {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

export async function updateServiceStatus(
  serviceId: string,
  isActive: boolean
) {
  try {
    const { error } = await supabase
      .from("services")
      .update({ is_active: isActive })
      .eq("id", serviceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating service status:", error);
    throw error;
  }
}

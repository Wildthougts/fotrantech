import { supabase } from "./supabase";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  image_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export async function getAllServices(includeDeleted = false) {
  try {
    let query = supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Service[];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export async function getActiveServices() {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Service[];
  } catch (error) {
    console.error("Error fetching active services:", error);
    throw error;
  }
}

export async function createService(
  service: Omit<Service, "id" | "created_at" | "updated_at" | "deleted_at">
) {
  try {
    const { data, error } = await supabase
      .from("services")
      .insert([service])
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

export async function updateService(id: string, updates: Partial<Service>) {
  try {
    const { data, error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

export async function deleteService(id: string) {
  try {
    const { error } = await supabase
      .from("services")
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
      })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

export async function toggleServiceStatus(id: string, currentStatus: boolean) {
  try {
    const { data, error } = await supabase
      .from("services")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  } catch (error) {
    console.error("Error toggling service status:", error);
    throw error;
  }
}

'use server';

import { supabase } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export async function deleteService(serviceId: string) {
  try {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) throw error;
    
    revalidatePath('/admin/services');
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: 'Failed to delete service' };
  }
}

export async function toggleServiceStatus(serviceId: string, currentStatus: boolean) {
  try {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !currentStatus })
      .eq("id", serviceId);

    if (error) throw error;
    
    revalidatePath('/admin/services');
    return { success: true };
  } catch (error) {
    console.error('Error updating service status:', error);
    return { success: false, error: 'Failed to update service status' };
  }
} 
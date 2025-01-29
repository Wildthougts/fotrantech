import { supabase } from './supabase';

export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  
  return !error && data !== null;
}

export async function addAdmin(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if user is already an admin
    const isAlreadyAdmin = await isAdmin(userId);
    if (isAlreadyAdmin) {
      return { success: false, error: 'User is already an admin' };
    }

    // Get current admin count
    const { count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    // Limit to 2 admins maximum
    if (count && count >= 2) {
      return { success: false, error: 'Maximum number of admins (2) reached' };
    }

    const { error } = await supabase
      .from('admin_users')
      .insert([{ user_id: userId }]);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding admin:', error);
    return { success: false, error: 'Failed to add admin' };
  }
}

export async function removeAdmin(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get current admin count
    const { count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    // Prevent removing the last admin
    if (count && count <= 1) {
      return { success: false, error: 'Cannot remove the last admin' };
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing admin:', error);
    return { success: false, error: 'Failed to remove admin' };
  }
}

export async function getAdminCount(): Promise<number> {
  const { count, error } = await supabase
    .from('admin_users')
    .select('*', { count: 'exact', head: true });
  
  return error ? 0 : (count || 0);
}

// Function to initialize the first admin
export async function initializeFirstAdmin(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if there are any admins
    const adminCount = await getAdminCount();
    
    // Only proceed if there are no admins
    if (adminCount === 0) {
      const { error } = await supabase
        .from('admin_users')
        .insert([{ user_id: userId }]);
      
      if (error) throw error;
      return { success: true };
    }
    
    return { success: false, error: 'Admins already exist' };
  } catch (error) {
    console.error('Error initializing first admin:', error);
    return { success: false, error: 'Failed to initialize first admin' };
  }
} ``
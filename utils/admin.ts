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

export async function addAdmin(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('admin_users')
    .insert([{ user_id: userId }]);
  
  return !error;
}

export async function removeAdmin(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('user_id', userId);
  
  return !error;
}

export async function getAdminCount(): Promise<number> {
  const { count, error } = await supabase
    .from('admin_users')
    .select('*', { count: 'exact', head: true });
  
  return error ? 0 : (count || 0);
} 
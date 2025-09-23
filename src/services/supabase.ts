import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let supabase: SupabaseClient | null = null;

export const initializeSupabase = (): SupabaseClient => {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      'Supabase URL and Anon Key are required. Please check your .env file.'
    );
  }

  if (!supabase) {
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  return supabase;
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    return initializeSupabase();
  }
  return supabase;
};

export { supabase };
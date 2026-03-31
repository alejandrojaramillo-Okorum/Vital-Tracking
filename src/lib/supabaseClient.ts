import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BloodPressureLog = {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  status: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  dark_mode: boolean;
  email_alerts: boolean;
};


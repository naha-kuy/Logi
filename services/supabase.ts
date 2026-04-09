/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

/**
 * --- SERVICE LAYER ---
 * Mengatur komunikasi dengan Database & Auth Provider (Supabase).
 * File ini menginisialisasi dan mengekspor instance client Supabase.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

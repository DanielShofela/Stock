import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = 'https://rpvseqenwdmjozshdcfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdnNlcWVud2Rtam96c2hkY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzkwNjcsImV4cCI6MjA3NjY1NTA2N30.wYVjrfV6JEWTUnyjVCT-Fj9uz0aHwrMS4yRip1aVOf0';

// This flag is now always true since credentials are provided.
export const isSupabaseConfigured = true;

// Initialize the client directly.
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseKey);

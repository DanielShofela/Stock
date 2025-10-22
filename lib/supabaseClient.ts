import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// IMPORTANT: Replace with your Supabase project's URL and anon key
const supabaseUrl = process.env.SUPABASE_URL || 'https://rpvseqenwdmjozshdcfm.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdnNlcWVud2Rtam96c2hkY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzkwNjcsImV4cCI6MjA3NjY1NTA2N30.wYVjrfV6JEWTUnyjVCT-Fj9uz0aHwrMS4yRip1aVOf0';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn("Supabase URL and Key are not configured. Please replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' in lib/supabaseClient.ts with your actual project credentials.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
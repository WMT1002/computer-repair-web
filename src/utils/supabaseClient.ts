import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjlkmdhwlcwqcvgyzktv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbGttZGh3bGN3cWN2Z3l6a3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTQwODMsImV4cCI6MjEwMjc5MDA4M30.bYfNvR4fuuCZ-5IaUZioo62eTJ2KYBppth3_P_D4cp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

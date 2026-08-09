import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rujxkxfzsdoczyftmvux.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anhreGZ6c2RvY3p5ZnRtdnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTMzNzYsImV4cCI6MjEwMDM2OTM3Nn0.QzeTGXKk0cp7wv6-Eeb61trhP_2zd6so2rcPzZTLLtk';

export const supabase = createClient(supabaseUrl, supabaseKey);

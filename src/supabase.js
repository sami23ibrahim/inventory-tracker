import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvsfkhtnricoojiwjbln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c2ZraHRucmljb29qaXdqYmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODEwODgsImV4cCI6MjA2MTI1NzA4OH0.ruuAoT7QfRDGg_7ObgKWB4A_niLzqku-H2PHjwL5DJ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

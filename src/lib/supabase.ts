import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcdsrspdpmwkhzczdlmt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHNyc3BkcG13a2h6Y3pkbG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzEzMTEsImV4cCI6MjA5MzY0NzMxMX0.MC9g6YZ36g0xAzqrEJdnqBfhtaIm91GGqyXafIbU1_Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
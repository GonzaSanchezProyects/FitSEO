import { createClient } from '@supabase/supabase-js';

// Reemplaza estos dos valores con los de tu proyecto
const supabaseUrl = 'https://iudytwrjwakvlevlsfyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1ZHl0d3Jqd2FrdmxldmxzZnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzgwODMsImV4cCI6MjA3OTc1NDA4M30.vi6C20lqcvuTZElyHSAfH48b7Y6_dcIxp_KEmtipsdM';

export const supabase = createClient(supabaseUrl, supabaseKey); 
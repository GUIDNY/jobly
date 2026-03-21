import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tfyodjqusfwqmbjgwikf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeW9kanF1c2Z3cW1iamd3aWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzg3MDEsImV4cCI6MjA4OTYxNDcwMX0.Ff4AvqCcfqTGhMqRqdK9K_I98oAk-osLK71MORUTJXQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

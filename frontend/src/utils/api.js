import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://wwpiqtxvoobhhgywkkmy.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3cGlxdHh2b29iaGhneXdra215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgxMDksImV4cCI6MjA3NjYxNDEwOX0.YzGzwnlxsQ38yYu-9NU7KGTaJMbDwSCj7uEScMnnYOg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

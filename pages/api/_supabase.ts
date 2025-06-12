import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY! // Usa SUPABASE_KEY, que deve ser a service_role no backend
);

export default supabase;

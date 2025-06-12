import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_KEY! // Usa a chave service_role para o backend
);

export default supabase;

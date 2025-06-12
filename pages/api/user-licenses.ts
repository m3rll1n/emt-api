import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  console.log('USER LICENSES - REQUEST:', req.method, req.body, req.query);
  if (req.method === 'OPTIONS') {
    console.log('USER LICENSES - OPTIONS preflight');
    return res.status(200).end();
  }
  const { user_id, domain } = req.query;
  // GET: Listar licenças da agência
  if (req.method === 'GET' && req.query.agency_id) {
    const { agency_id } = req.query;
    console.log('USER LICENSES - GET BY AGENCY_ID:', agency_id);
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('agency_id', agency_id);
    if (error) {
      console.error('USER LICENSES - ERRO AO BUSCAR LICENCAS POR AGENCY_ID:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    console.log('USER LICENSES - LICENCAS ENCONTRADAS:', data);
    return res.status(200).json(data || []);
  }
  if (req.method === 'GET') {
    console.log('USER LICENSES - GET BY USER_ID/DOMAIN:', user_id, domain);
    const { data, error } = await supabase
      .from('licenses')
      .select('expires_at')
      .eq('user_id', user_id)
      .eq('domain', domain)
      .single();
    if (error) {
      console.error('USER LICENSES - ERRO AO BUSCAR LICENCA POR USER_ID/DOMAIN:', error);
      return res.status(200).json({ license_expires_at: null });
    }
    console.log('USER LICENSES - LICENSE ENCONTRADA:', data);
    return res.status(200).json({ license_expires_at: data?.expires_at || null });
  }
  console.warn('USER LICENSES - METHOD NOT ALLOWED:', req.method);
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

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
    // Busca as licenças e faz join com users para trazer o email
    const { data, error } = await supabase
      .from('licenses')
      .select('id, domain, license_key, status, created_at, expires_at, user_id, users(email)')
      .eq('agency_id', agency_id);
    if (error) {
      console.error('USER LICENSES - ERRO AO BUSCAR LICENCAS POR AGENCY_ID:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    // Mapeia para o formato esperado pelo frontend
    const mapped = (data || []).map(l => {
      let client_email = '';
      if (l.users && Array.isArray(l.users) && l.users.length > 0) {
        client_email = typeof l.users[0]?.email === 'string' ? l.users[0].email : '';
      } else if (l.users && typeof l.users === 'object' && l.users !== null && 'email' in l.users && typeof (l.users as any).email === 'string') {
        client_email = (l.users as any).email;
      }
      return {
        client_email,
        domain: l.domain,
        license_key: l.license_key,
        status: l.status,
        created: l.created_at,
        expires: l.expires_at
      };
    });
    console.log('USER LICENSES - LICENCAS ENCONTRADAS:', mapped);
    return res.status(200).json(mapped);
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

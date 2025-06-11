import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  console.log('USER LICENSES - REQUEST:', req.method, req.body, req.query);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  const { user_id, domain } = req.query;
  // GET: Listar licenças da agência
  if (req.method === 'GET' && req.query.agency_id) {
    const { agency_id } = req.query;
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('agency_id', agency_id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json(data || []);
  }
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('licenses')
      .select('expires_at')
      .eq('user_id', user_id)
      .eq('domain', domain)
      .single();
    if (error)
      return res.status(200).json({ license_expires_at: null });
    return res.status(200).json({ license_expires_at: data?.expires_at || null });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

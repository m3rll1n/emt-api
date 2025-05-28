import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, license_key, domain } = req.body;
    // Exemplo: buscar licença válida
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', user_id)
      .eq('license_key', license_key)
      .eq('domain', domain)
      .single();
    if (error || !data)
      return res.status(200).json({ valid: false, expires_at: null });
    return res.status(200).json({ valid: true, expires_at: data.expires_at || null });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

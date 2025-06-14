import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, domain } = req.body;
    if (!user_id || !domain) {
      return res.status(400).json({ success: false, message: 'user_id e domain são obrigatórios.' });
    }

    // Chama a função SQL do Supabase
    const { data, error } = await supabase.rpc('migrate_user_to_anon', {
      p_user_id: user_id,
      p_domain: domain
    });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: 'Migração concluída', data });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

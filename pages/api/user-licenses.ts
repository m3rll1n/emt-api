import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, domain } = req.query;
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

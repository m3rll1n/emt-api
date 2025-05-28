import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (error) return res.status(404).json({ success: false, message: error.message });
    return res.status(200).json({
      downloads_this_week: data?.downloads_this_week || 0,
      last_download_reset: data?.last_download_reset || null,
      is_premium: data?.is_premium || false,
      full_name: data?.full_name || '',
    });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

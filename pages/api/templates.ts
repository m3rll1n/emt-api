import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('templates').select('*');
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json(data || []);
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

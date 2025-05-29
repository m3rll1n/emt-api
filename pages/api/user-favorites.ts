import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('favorite_templates')
      .select('template_id')
      .eq('user_id', user_id);
    if (error) return res.status(200).json([]);
    return res.status(200).json(data?.map((f: any) => f.template_id) || []);
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

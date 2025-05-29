import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, template_id } = req.body;
    const { error } = await supabase.from('favorite_templates').delete().eq('user_id', user_id).eq('template_id', template_id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, message: 'Favorito removido' });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

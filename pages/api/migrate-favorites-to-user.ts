import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, template_ids } = req.body;
    if (!Array.isArray(template_ids)) return res.status(400).json({ success: false, message: 'template_ids must be array' });
    const inserts = template_ids.map((template_id: string) => ({ user_id, template_id }));
    const { error } = await supabase.from('favorites').insert(inserts);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, message: 'Favoritos migrados' });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

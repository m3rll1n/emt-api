import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id obrigatório' });

    // Limite de 12 resultados
    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json(data);
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

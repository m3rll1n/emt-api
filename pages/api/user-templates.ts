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

  // Editar modelo do usuário
  if (req.method === 'PUT') {
    const { id, user_id, name, category, media, json_url, is_public } = req.body;
    if (!id || !user_id) return res.status(400).json({ success: false, message: 'id e user_id obrigatórios' });
    const { data, error } = await supabase
      .from('user_templates')
      .update({ name, category, media, json_url, is_public, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user_id)
      .select();
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data });
  }

  // Excluir modelo do usuário
  if (req.method === 'DELETE') {
    const { id, user_id } = req.body;
    if (!id || !user_id) return res.status(400).json({ success: false, message: 'id e user_id obrigatórios' });
    const { error } = await supabase
      .from('user_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}

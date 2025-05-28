import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, domain, template_id } = req.body;
    // Lógica de download (exemplo: inserir registro de download)
    const { error } = await supabase.from('downloads').insert([
      { user_id, domain, template_id, created_at: new Date().toISOString() },
    ]);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, message: 'Download registrado' });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

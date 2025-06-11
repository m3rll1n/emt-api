import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // PATCH: Atualizar conta da agência
  if (req.method === 'PATCH') {
    const { agency_id, email, password } = req.body;
    if (!agency_id || (!email && !password)) {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    let updateData: any = {};
    if (email) updateData.email = email;
    if (password) updateData.password_hash = password; // hash recomendado em produção
    const { error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('id', agency_id);
    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao atualizar agência.' });
    }
    return res.status(200).json({ success: true });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

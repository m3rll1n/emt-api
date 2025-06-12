import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('AGENCY ACCOUNT - BODY:', req.body);

  // GET: Buscar dados da agência (incluindo license_limit)
  if (req.method === 'GET') {
    const { agency_id } = req.query;
    if (!agency_id) {
      return res.status(400).json({ success: false, message: 'agency_id obrigatório' });
    }
    const { data, error } = await supabase
      .from('agencies')
      .select('id, name, email, license_limit')
      .eq('id', agency_id)
      .single();
    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Agência não encontrada.' });
    }
    return res.status(200).json(data);
  }

  // PATCH: Atualizar conta da agência
  if (req.method === 'PATCH') {
    const { agency_id, email, password } = req.body;
    if (!agency_id || (!email && !password)) {
      console.warn('AGENCY ACCOUNT - DADOS OBRIGATÓRIOS AUSENTES:', req.body);
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
      console.error('AGENCY ACCOUNT - ERRO AO ATUALIZAR:', error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar agência.' });
    }
    console.log('AGENCY ACCOUNT - SUCESSO:', agency_id);
    return res.status(200).json({ success: true });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

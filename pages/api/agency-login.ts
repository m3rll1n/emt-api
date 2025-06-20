import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-super-seguro';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Libera CORS para todos os domínios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  console.log('AGENCY LOGIN - BODY:', req.body);
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
  }
  // Busca agência pelo email
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('id, name, email, password_hash')
    .eq('email', email)
    .single();
  console.log('AGENCY LOGIN - AGENCY:', agency);
  if (error || !agency) {
    console.error('AGENCY LOGIN - ERRO AO BUSCAR AGENCIA:', error);
    return res.status(401).json({ success: false, message: 'Agência não encontrada.' });
  }
  // Validação simples de senha (em produção, use hash seguro)
  if (agency.password_hash !== password) {
    console.warn('AGENCY LOGIN - SENHA INVALIDA para:', email);
    return res.status(401).json({ success: false, message: 'Senha inválida.' });
  }
  // Gera token JWT
  const token = jwt.sign({ agency_id: agency.id, email: agency.email, name: agency.name }, JWT_SECRET, { expiresIn: '12h' });
  console.log('AGENCY LOGIN - SUCESSO:', agency.id);
  return res.status(200).json({ success: true, token, agency_id: agency.id, name: agency.name });
}

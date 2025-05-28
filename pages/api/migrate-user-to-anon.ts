import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, domain } = req.body;
    // Exemplo: migrar downloads de usuário para anônimo
    // (implemente a lógica conforme seu schema Supabase)
    // Aqui apenas retorna sucesso para exemplo
    return res.status(200).json({ success: true, message: 'Migração concluída' });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

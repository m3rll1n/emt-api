import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  console.log('AGENCY CREATE LICENSE - BODY:', req.body);
  // POST: Criar nova licença para agência
  if (req.method === 'POST') {
    const { agency_id, email, domain } = req.body;
    if (!agency_id || !email || !domain) {
      console.warn('AGENCY CREATE LICENSE - DADOS OBRIGATÓRIOS AUSENTES:', req.body);
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    // Busca limite de licenças da agência
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('license_limit')
      .eq('id', agency_id)
      .single();
    if (agencyError || !agency) {
      console.error('AGENCY CREATE LICENSE - AGENCIA NAO ENCONTRADA:', agencyError);
      return res.status(404).json({ success: false, message: 'Agência não encontrada.' });
    }
    // Conta licenças já emitidas
    const { count, error: countError } = await supabase
      .from('licenses')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency_id);
    if (countError) {
      console.error('AGENCY CREATE LICENSE - ERRO AO CONTAR LICENCAS:', countError);
      return res.status(500).json({ success: false, message: 'Erro ao contar licenças.' });
    }
    if (count >= agency.license_limit) {
      console.warn('AGENCY CREATE LICENSE - LIMITE ATINGIDO:', { count, limit: agency.license_limit });
      return res.status(403).json({ success: false, message: 'Limite de licenças atingido.' });
    }
    // Cria nova licença
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .insert([{ agency_id, domain, user_id: null, license_key: undefined }])
      .select()
      .single();
    if (licenseError || !license) {
      console.error('AGENCY CREATE LICENSE - ERRO AO CRIAR LICENCA:', licenseError);
      return res.status(500).json({ success: false, message: 'Erro ao criar licença.' });
    }
    console.log('AGENCY CREATE LICENSE - SUCESSO:', license);
    return res.status(201).json({ key: license.license_key });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

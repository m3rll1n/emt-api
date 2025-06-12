import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Libera CORS para todos os domínios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    console.log('AGENCY CREATE LICENSE - OPTIONS preflight');
    return res.status(200).end();
  }
  console.log('AGENCY CREATE LICENSE - METHOD:', req.method);
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
    // Buscar o user_id apenas pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (userError || !user) {
      console.error('AGENCY CREATE LICENSE - USUARIO NAO ENCONTRADO:', userError);
      return res.status(404).json({ success: false, message: 'Usuário não encontrado para este email.' });
    }
    // Cria nova licença
    // Gera um license_key aleatório no formato UUID
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    const licenseKey = uuidv4();
    console.log('AGENCY CREATE LICENSE - GERANDO LICENSE_KEY:', licenseKey);
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .insert([{ agency_id, domain, user_id: user.id, license_key: licenseKey }])
      .select()
      .single();
    if (licenseError || !license) {
      console.error('AGENCY CREATE LICENSE - ERRO AO CRIAR LICENCA:', licenseError);
      return res.status(500).json({ success: false, message: 'Erro ao criar licença.' });
    }
    console.log('AGENCY CREATE LICENSE - SUCESSO:', license);
    return res.status(201).json({ key: license.license_key });
  }
  console.warn('AGENCY CREATE LICENSE - METHOD NOT ALLOWED:', req.method);
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

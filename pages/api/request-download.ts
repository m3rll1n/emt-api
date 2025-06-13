import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, domain, template_id } = req.body;
    console.log('REQUEST-DOWNLOAD - BODY:', req.body);
    if (user_id) {
      // Usuário logado: registra em downloads
      const { error } = await supabase.from('downloads').insert([
        { user_id, domain, template_id, created_at: new Date().toISOString() },
      ]);
      if (error) {
        console.error('REQUEST-DOWNLOAD - ERRO AO INSERIR (logado):', error);
        return res.status(400).json({ success: false, message: error.message });
      }
      console.log('REQUEST-DOWNLOAD - SUCESSO (logado):', { user_id, domain, template_id });
      return res.status(200).json({ success: true, message: 'Download registrado' });
    } else if (domain) {
      // Usuário anônimo: registra/incrementa em anon_downloads
      // Busca registro existente
      const { data, error } = await supabase
        .from('anon_downloads')
        .select('*')
        .eq('domain', domain)
        .single();
      if (error && error.code !== 'PGRST116') {
        // Erro diferente de "not found"
        console.error('REQUEST-DOWNLOAD - ERRO AO BUSCAR ANON:', error);
        return res.status(400).json({ success: false, message: error.message });
      }
      let downloads_this_week = 1;
      let last_download_reset = new Date().toISOString();
      if (data) {
        // Já existe registro, incrementa
        downloads_this_week = (data.downloads_this_week || 0) + 1;
        last_download_reset = data.last_download_reset;
      }
      // Upsert (atualiza ou insere)
      const { error: upsertError } = await supabase
        .from('anon_downloads')
        .upsert({ domain, downloads_this_week, last_download_reset }, { onConflict: ['domain'] });
      if (upsertError) {
        console.error('REQUEST-DOWNLOAD - ERRO AO INSERIR/ATUALIZAR ANON:', upsertError);
        return res.status(400).json({ success: false, message: upsertError.message });
      }
      console.log('REQUEST-DOWNLOAD - SUCESSO (anon):', { domain, downloads_this_week });
      return res.status(200).json({ success: true, message: 'Download anônimo registrado' });
    } else {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

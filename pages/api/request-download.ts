import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, domain, template_id } = req.body;
    console.log('REQUEST-DOWNLOAD - BODY:', req.body);
    let downloadSuccess = false;
    if (user_id) {
      // Usuário logado: registra em downloads
      const { error } = await supabase.from('downloads').insert([
        { user_id, domain, template_id, created_at: new Date().toISOString() },
      ]);
      if (error) {
        console.error('REQUEST-DOWNLOAD - ERRO AO INSERIR (logado):', error);
        return res.status(400).json({ success: false, message: error.message });
      }
      // Incrementa downloads_this_week na tabela users
      const { error: updateError } = await supabase.rpc('increment_user_downloads', { p_user_id: user_id });
      if (updateError) {
        console.error('REQUEST-DOWNLOAD - ERRO AO INCREMENTAR downloads_this_week:', updateError);
        return res.status(400).json({ success: false, message: updateError.message });
      }
      downloadSuccess = true;
      console.log('REQUEST-DOWNLOAD - SUCESSO (logado):', { user_id, domain, template_id });
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
        .upsert([{ domain, downloads_this_week, last_download_reset }], { onConflict: 'domain' });
      if (upsertError) {
        console.error('REQUEST-DOWNLOAD - ERRO AO INSERIR/ATUALIZAR ANON:', upsertError);
        return res.status(400).json({ success: false, message: upsertError.message });
      }
      downloadSuccess = true;
      console.log('REQUEST-DOWNLOAD - SUCESSO (anon):', { domain, downloads_this_week });
    } else {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }

    // Se o download foi registrado, buscar o template e retornar o JSON
    if (downloadSuccess) {
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('json_url')
        .eq('id', template_id)
        .single();
      if (templateError || !template?.json_url) {
        console.error('REQUEST-DOWNLOAD - TEMPLATE NÃO ENCONTRADO:', templateError);
        return res.status(404).json({ success: false, message: 'Template não encontrado.' });
      }
      try {
        const response = await fetch(template.json_url);
        if (!response.ok) throw new Error('Erro ao baixar JSON do template');
        const json = await response.json();
        return res.status(200).json({ success: true, json });
      } catch (err) {
        console.error('REQUEST-DOWNLOAD - ERRO AO BAIXAR JSON:', err);
        return res.status(500).json({ success: false, message: 'Erro ao baixar JSON do template.' });
      }
    }
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

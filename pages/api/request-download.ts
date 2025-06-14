import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, domain, template_id } = req.body;
    console.log('REQUEST-DOWNLOAD - BODY:', req.body);

    // Chama a função RPC com a ordem correta dos argumentos
    const { data, error } = await supabase.rpc('request_download', {
      p_user_id: user_id || null,
      p_template_id: template_id,
      p_domain: domain,
    });
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (!data || !data[0] || data[0].success === false) {
      return res.status(400).json({ success: false, message: data?.[0]?.message || 'Erro ao iniciar download.' });
    }

    // Se chegou aqui, download permitido, buscar o template e retornar o JSON
    // Descobre se é template global ou user_template
    let templateUrl = null;
    if (user_id) {
      // Tenta buscar em user_templates primeiro
      const { data: userTemplate, error: userTplErr } = await supabase
        .from('user_templates')
        .select('json_url')
        .eq('id', template_id)
        .single();
      if (userTemplate && userTemplate.json_url) {
        templateUrl = userTemplate.json_url;
      }
    }
    if (!templateUrl) {
      // Busca em templates globais
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('json_url')
        .eq('id', template_id)
        .single();
      if (template && template.json_url) {
        templateUrl = template.json_url;
      }
    }
    if (!templateUrl) {
      return res.status(404).json({ success: false, message: 'Template não encontrado.' });
    }
    try {
      const response = await fetch(templateUrl);
      if (!response.ok) throw new Error('Erro ao baixar JSON do template');
      const json = await response.json();
      return res.status(200).json({ success: true, json });
    } catch (err) {
      console.error('REQUEST-DOWNLOAD - ERRO AO BAIXAR JSON:', err);
      return res.status(500).json({ success: false, message: 'Erro ao baixar JSON do template.' });
    }
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

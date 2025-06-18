import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Busca todos os templates
    const { data: templates, error: errorTemplates } = await supabase.from('templates').select('*');
    if (errorTemplates) return res.status(500).json({ success: false, message: errorTemplates.message });

    // Busca todas as relações template-categoria
    const { data: templateCategories, error: errorTC } = await supabase.from('template_categories').select('*');
    if (errorTC) return res.status(500).json({ success: false, message: errorTC.message });

    // Busca todos os nomes de categorias
    const { data: categories, error: errorCat } = await supabase.from('categories').select('*');
    if (errorCat) return res.status(500).json({ success: false, message: errorCat.message });

    // Monta um map de id -> nome da categoria
    const catMap = Object.fromEntries((categories || []).map(c => [c.id, c.name]));

    // Monta as categorias de cada template
    const normalized = (templates || []).map(t => {
      const cats = (templateCategories || [])
        .filter(tc => tc.template_id === t.id)
        .map(tc => catMap[tc.category_id])
        .filter(Boolean);
      // Adiciona aviso se emtpro for true
      let emtpro_warning = undefined;
      if (t.emtpro === true) {
        emtpro_warning = 'Esse template possui recursos que precisam do Elementor Pro';
      }
      return {
        ...t,
        categories: cats,
        author: t.author || null,
        description: t.description || null,
        emtpro: t.emtpro || false,
        emtpro_warning
      };
    });
    return res.status(200).json(normalized);
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

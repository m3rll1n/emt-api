import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.query;
  console.log('ANON-DOWNLOADS - REQUEST:', req.method, req.query, req.body);
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('anon_downloads')
      .select('*')
      .eq('domain', domain)
      .single();
    if (error) {
      console.error('ANON-DOWNLOADS - ERRO AO BUSCAR:', error);
      return res.status(404).json({ success: false, message: error.message });
    }
    console.log('ANON-DOWNLOADS - ENCONTRADO:', data);
    return res.status(200).json({
      downloads_this_week: data?.downloads_this_week || 0,
      last_download_reset: data?.last_download_reset || null,
      id: data?.id || null,
    });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

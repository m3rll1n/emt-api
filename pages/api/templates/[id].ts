import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ success: false, message: error.message });
    let emtpro_warning = undefined;
    if (data?.emtpro === true) {
      emtpro_warning = 'Esse template possui recursos que precisam do Elementor Pro';
    }
    return res.status(200).json({
      ...data,
      author: data?.author || null,
      description: data?.description || null,
      emtpro: data?.emtpro || false,
      emtpro_warning
    });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

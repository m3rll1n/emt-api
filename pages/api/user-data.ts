import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  // GET: Listar clientes da agência
  if (req.method === 'GET' && req.query.agency_id) {
    const { agency_id } = req.query;
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('agency_id', agency_id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json(data || []);
  }
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('downloads_this_week, last_download_reset, full_name, country, state, city')
      .eq('id', user_id)
      .single();
    if (error || !data) return res.status(404).json({ success: false, message: error?.message || 'Usuário não encontrado' });
    // Verifica se o usuário é premium (tem licença válida)
    const { data: lic } = await supabase
      .from('licenses')
      .select('id')
      .eq('user_id', user_id)
      .gt('license_expires_at', new Date().toISOString())
      .maybeSingle();
    const is_premium = !!lic;
    return res.status(200).json({
      downloads_this_week: data.downloads_this_week || 0,
      last_download_reset: data.last_download_reset || null,
      is_premium,
      full_name: data.full_name || '',
      country: data.country || '',
      state: data.state || '',
      city: data.city || ''
    });
  }
  // POST: Cadastrar novo cliente
  if (req.method === 'POST') {
    const { agency_id, name, email } = req.body;
    if (!agency_id || !name || !email) {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    const { data, error } = await supabase
      .from('users')
      .insert([{ agency_id, full_name: name, email }])
      .select('id, full_name, email')
      .single();
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(201).json(data);
  }
  // PUT: Editar cliente
  if (req.method === 'PUT') {
    const { agency_id, id, name, email } = req.body;
    if (!agency_id || !id || !name || !email) {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    const { error } = await supabase
      .from('users')
      .update({ full_name: name, email })
      .eq('id', id)
      .eq('agency_id', agency_id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json({ success: true });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

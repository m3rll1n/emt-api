import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  console.log('USER DATA - REQUEST:', req.method, req.body, req.query);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
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
    const { agency_id, name, email, id, password } = req.body;
    if (!agency_id || !name || !email) {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    // Verifica se já existe usuário com o mesmo email
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }
    // Se id não for enviado, cria usuário no auth e usa o id retornado
    let userId = id;
    if (!userId) {
      // Cria usuário no auth do Supabase
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: password || Math.random().toString(36).slice(-10), // senha aleatória se não enviada
        email_confirm: true
      });
      if (authError || !authUser || !authUser.user) {
        return res.status(500).json({ success: false, message: 'Erro ao criar usuário no auth: ' + (authError?.message || 'desconhecido') });
      }
      userId = authUser.user.id;
    }
    // Agora insere na tabela users
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, agency_id, full_name: name, email }])
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

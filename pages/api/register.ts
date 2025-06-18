import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, username } = req.body;
    // Cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ success: false, message: error.message });
    // Após criar no Auth, cria registro na tabela users (caso não exista)
    if (data?.user?.id && data?.user?.email) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        username: username || null,
        created_at: new Date().toISOString(),
        downloads_this_week: 0,
        last_download_reset: new Date().toISOString()
      });
    }
    // Inclui username na resposta
    return res.status(200).json({ ...data.user, username });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

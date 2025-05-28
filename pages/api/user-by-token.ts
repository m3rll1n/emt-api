import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from './_supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await supabase.auth.getUser(token as string);
    if (error) return res.status(401).json({ success: false, message: error.message });
    return res.status(200).json(data.user);
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// Get dashboard stats (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const { data: usersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { data: casesCount } = await supabase
      .from('cases')
      .select('id', { count: 'exact', head: true });

    const { data: lawyersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('user_type', 'lawyer');

    const { data: policeCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('user_type', 'police');

    res.json({
      stats: {
        totalUsers: usersCount?.length || 0,
        totalCases: casesCount?.length || 0,
        totalLawyers: lawyersCount?.length || 0,
        totalPolice: policeCount?.length || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

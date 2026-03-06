import express from 'express';
import { supabase } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address } = req.body;

    // Users can only update their own profile, admins can update anyone
    if (req.user.id !== id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        address,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ message: 'User updated successfully', user: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by type (admin, lawyer, police)
router.get('/type/:userType', authenticateToken, async (req, res) => {
  try {
    const { userType } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', userType)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

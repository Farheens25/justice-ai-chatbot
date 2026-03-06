import express from 'express';
import { supabase } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Invite team member (Admin only)
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Only admins can invite team members' });
    }

    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({ error: 'Email and user type are required' });
    }

    const validUserTypes = ['admin', 'lawyer', 'police'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Create user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false,
      user_metadata: {
        user_type: userType,
        invited_by: req.user.id,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Store team member record
    const { error: teamError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        user_type: userType,
        created_at: new Date(),
        invited_by: req.user.id,
      });

    if (teamError) {
      console.error('Team member record error:', teamError);
    }

    res.status(201).json({
      message: `Invitation sent to ${email}`,
      user: {
        id: data.user.id,
        email,
        userType,
      },
      tempPassword, // In production, send this via email instead
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team members
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

    res.json({ teamMembers: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove team member (Admin only)
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove team members' });
    }

    const { userId } = req.params;

    // Delete from users table
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) throw dbError;

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Auth deletion error:', authError);
    }

    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team member role (Admin only)
router.put('/:userId/role', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    const { userId } = req.params;
    const { userType } = req.body;

    const validUserTypes = ['admin', 'lawyer', 'police'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ user_type: userType })
      .eq('id', userId)
      .select();

    if (error) throw error;

    res.json({ message: 'Role updated successfully', user: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

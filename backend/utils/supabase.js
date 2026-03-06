import { supabase } from '../server.js';

// User Management
export const createUserProfile = async (userId, email, fullName, userType) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      user_type: userType,
      created_at: new Date(),
    });

  return { data, error };
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select();

  return { data: data?.[0], error };
};

export const getUsersByType = async (userType) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_type', userType);

  return { data, error };
};

// Team Management
export const getAllTeamMembers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const removeTeamMember = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  return error;
};

export const updateTeamMemberRole = async (userId, newRole) => {
  const { data, error } = await supabase
    .from('users')
    .update({ user_type: newRole })
    .eq('id', userId)
    .select();

  return { data: data?.[0], error };
};

// Supabase Auth Helpers
export const createAuthUser = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  return { data, error };
};

export const deleteAuthUser = async (userId) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  return error;
};

export const resetUserPassword = async (userId, newPassword) => {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  return error;
};

// Email/Communication
export const sendInviteEmail = async (email, inviteLink) => {
  // TODO: Implement email sending (use SendGrid, Nodemailer, etc.)
  console.log(`Invite link for ${email}: ${inviteLink}`);
};

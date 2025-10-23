/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import { LoginCredentials, SignupCredentials, UserProfile, UpdateProfileData } from '@/types/auth';
import { AuthError } from '@supabase/supabase-js';

/**
 * Sign up a new user
 */
export const signUp = async (credentials: SignupCredentials) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.full_name,
        },
      },
    });

    if (error) throw error;

    // Create user profile in profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: credentials.email,
          full_name: credentials.full_name,
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error: error as AuthError };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (credentials: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error: error as AuthError };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: error as AuthError };
  }
};

/**
 * Get user profile from profiles table with timeout
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('getUserProfile: Fetching profile for user:', userId);
    
    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Profile query timeout after 5 seconds')), 5000);
    });
    
    // Race between the query and timeout
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    console.log('getUserProfile: Query completed. Data:', data, 'Error:', error);

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    // Return null instead of throwing - app will work without profile
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: UpdateProfileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error: error as AuthError };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error: error as AuthError };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error sending reset email:', error);
    return { error: error as AuthError };
  }
};

/**
 * Check if user is admin by checking auth.users.is_super_admin
 * Uses PostgreSQL RPC function to query auth.users table
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    console.log('checkIsAdmin: Checking admin status for user:', userId);
    
    // Create timeout promise
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('checkIsAdmin: ⏱️ Timeout after 3 seconds - assuming not admin');
        resolve(false);
      }, 3000);
    });
    
    // Method 1: Try RPC function (if it exists)
    const rpcPromise = (async () => {
      const { data: isAdmin, error: rpcError } = await supabase
        .rpc('is_user_admin', { user_id: userId });
      
      if (!rpcError && isAdmin !== null) {
        console.log('checkIsAdmin: ✅ Admin via RPC:', isAdmin);
        return isAdmin;
      }
      
      // Method 2: Check app_metadata from current session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && user) {
        const isAdminFromMeta = user.app_metadata?.is_super_admin === true;
        if (isAdminFromMeta) {
          console.log('checkIsAdmin: ✅ Admin via app_metadata');
          return true;
        }
      }
      
      // Method 3: Fallback to profiles table (if exists)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid error if table doesn't exist
      
      if (!profileError && profileData) {
        const isAdminFromProfile = profileData.role === 'admin';
        console.log('checkIsAdmin: Result from profiles:', isAdminFromProfile);
        return isAdminFromProfile;
      }
      
      console.log('checkIsAdmin: ❌ Not admin or unable to verify');
      return false;
    })();
    
    // Race between check and timeout
    const result = await Promise.race([rpcPromise, timeoutPromise]);
    console.log('checkIsAdmin: Final result:', result);
    return result;
    
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    await updateUserProfile(userId, { avatar_url: urlData.publicUrl } as any);

    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { data: null, error: error as Error };
  }
};


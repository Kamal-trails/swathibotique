/**
 * Authentication Context
 * Manages global authentication state and provides auth functions
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthState, LoginCredentials, SignupCredentials, UserProfile, UpdateProfileData } from '@/types/auth';
import { 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut,
  getUserProfile,
  updateUserProfile as updateProfile,
  checkIsAdmin,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword
} from '@/services/authService';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  });
  
  // Track if we're currently in a manual sign-in to prevent duplicate profile loading
  const isSigningIn = useRef(false);

  // Load user profile
  const loadUserProfile = async (user: SupabaseUser) => {
    try {
      console.log('Loading profile for user:', user.id);
      const profile = await getUserProfile(user.id);
      console.log('Profile loaded:', profile);
      
      const isAdmin = await checkIsAdmin(user.id);
      console.log('Is admin:', isAdmin);
      
      setState(prev => ({
        ...prev,
        user,
        profile,
        isAdmin,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set user anyway, even if profile loading fails
      setState(prev => ({
        ...prev,
        user,
        profile: null,
        isAdmin: false,
        loading: false,
      }));
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      
      // Skip SIGNED_IN if we're in the middle of manual signIn
      if (event === 'SIGNED_IN' && isSigningIn.current) {
        console.log('⏭️ Skipping onAuthStateChange - handled by signIn function');
        return;
      }
      
      // Handle SIGNED_OUT event
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false,
        });
        return;
      }
      
      // Handle other auth state changes
      if (session?.user) {
        console.log('👤 Loading profile from onAuthStateChange');
        await loadUserProfile(session.user);
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in
  const signIn = async (credentials: LoginCredentials) => {
    try {
      isSigningIn.current = true; // Mark that we're signing in
      
      const { data, error } = await authSignIn(credentials);
      
      if (error) {
        isSigningIn.current = false;
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        isSigningIn.current = false; // Reset flag after profile loaded
        toast.success('Welcome back!');
        return { success: true };
      }

      isSigningIn.current = false;
      return { success: false, error: 'Login failed' };
    } catch (error) {
      isSigningIn.current = false;
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  // Sign up
  const signUp = async (credentials: SignupCredentials) => {
    try {
      const { data, error } = await authSignUp(credentials);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success('Account created! Please check your email to verify your account.');
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await authSignOut();
      setState({
        user: null,
        profile: null,
        loading: false,
        isAdmin: false,
      });
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Signout error:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: UpdateProfileData) => {
    try {
      if (!state.user) {
        return { success: false, error: 'No user logged in' };
      }

      const { data, error } = await updateProfile(state.user.id, updates);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setState(prev => ({
          ...prev,
          profile: data as UserProfile,
        }));
        toast.success('Profile updated successfully');
        return { success: true };
      }

      return { success: false, error: 'Update failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await authUpdatePassword(newPassword);
      
      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await authResetPassword(email);
      
      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Password reset email sent! Check your inbox.');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (state.user) {
      await loadUserProfile(state.user);
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    updatePassword,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


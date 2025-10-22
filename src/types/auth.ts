/**
 * Authentication and User Types
 */

import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  preferences?: {
    newsletter_subscribed?: boolean;
    notifications_enabled?: boolean;
  };
  role: 'customer' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  address?: UserProfile['address'];
  preferences?: UserProfile['preferences'];
}


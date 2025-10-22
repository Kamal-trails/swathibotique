# Supabase Setup Guide

This guide will help you set up Supabase authentication and database for JAANU BOUTIQUE.

## 📋 Prerequisites

- Supabase account (free tier is sufficient)
- Project created on Supabase

## 🔧 Setup Steps

### 1. Install Dependencies

First, install the Supabase client library:

```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://bkghokiqtocpimgpvwko.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Database Setup

#### A. Create User Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Anyone can insert their profile (for signup)
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Create index for faster queries
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);
```

#### B. Create Storage Bucket for Avatars (Optional)

1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `avatars`
3. Set it to Public
4. Add this policy:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public access to avatars
CREATE POLICY "Allow public access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 4. Create Your First Admin User

After signing up a user through the app, you'll need to manually set them as admin:

```sql
-- Find your user
SELECT id, email, full_name, role FROM profiles;

-- Set user as admin (replace with your user's id)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 5. Email Configuration (Optional but Recommended)

By default, Supabase requires email confirmation. To configure:

1. Go to Authentication → Settings in Supabase Dashboard
2. Configure email templates:
   - Confirm signup
   - Reset password
   - Magic link

You can also disable email confirmation for development:
- Go to Authentication → Settings
- Scroll to Email Auth
- Toggle "Enable email confirmations" off

## 🔐 Authentication Flow

### Sign Up
1. User fills signup form
2. Supabase creates auth user
3. App creates profile record in `profiles` table
4. Confirmation email sent (if enabled)
5. User confirms email and can log in

### Sign In
1. User enters email/password
2. Supabase authenticates
3. App fetches user profile
4. Session stored in localStorage
5. User redirected to dashboard/home

### Password Reset
1. User requests password reset
2. Reset email sent with magic link
3. User clicks link and sets new password
4. User can log in with new password

## 🛡️ Row Level Security (RLS)

RLS is enabled on the profiles table to ensure:
- Users can only see/edit their own profile
- Admins can see all profiles (add policy if needed)
- Data is secure by default

## 📊 Database Schema

### Profiles Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| email | TEXT | User's email address |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | URL to avatar image |
| phone | TEXT | Phone number |
| address | JSONB | Address object (street, city, state, etc.) |
| preferences | JSONB | User preferences |
| role | TEXT | 'customer' or 'admin' |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### Address JSONB Structure

```json
{
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India"
}
```

### Preferences JSONB Structure

```json
{
  "newsletter_subscribed": true,
  "notifications_enabled": true
}
```

## 🧪 Testing

### Test User Signup
1. Navigate to `/signup`
2. Fill in the form
3. Check your email for confirmation
4. Verify user created in Supabase Dashboard

### Test Login
1. Navigate to `/login`
2. Enter credentials
3. Should redirect to home with user menu visible

### Test Protected Routes
1. Log out
2. Try to access `/profile` or `/admin`
3. Should redirect to `/login`

### Test Admin Access
1. Set a user as admin in database
2. Log in with admin user
3. Should see "Admin" link in navigation
4. Can access `/admin` routes

## 🔍 Debugging

### Check Supabase Logs
- Go to Supabase Dashboard → Logs
- View API logs for authentication requests

### Common Issues

**1. "Missing Supabase environment variables"**
- Ensure `.env.local` exists and is properly formatted
- Restart dev server after creating `.env.local`

**2. "User not authenticated"**
- Check if email confirmation is required
- Verify user confirmed their email
- Check browser localStorage for session

**3. "Permission denied for table profiles"**
- Verify RLS policies are created
- Check policy conditions match your use case

**4. "Admin routes accessible by non-admin users"**
- Verify `role` column is set correctly
- Check ProtectedRoute implementation

## 🚀 Next Steps

After setup, you can:
1. Customize email templates in Supabase
2. Add OAuth providers (Google, GitHub, etc.)
3. Implement password strength requirements
4. Add 2FA authentication
5. Create admin dashboard for user management

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)


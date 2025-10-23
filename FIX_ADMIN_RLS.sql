-- =====================================================
-- FIX ADMIN STATUS - BYPASS RLS
-- Run this in Supabase SQL Editor
-- =====================================================

-- METHOD 1: Update using postgres role (bypasses RLS)
-- This should work directly in SQL Editor since you're authenticated as admin

-- First, let's check current status
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'is_super_admin' as is_super_admin_string,
  (raw_app_meta_data->>'is_super_admin')::boolean as is_super_admin_bool
FROM auth.users
WHERE email = 'manikamalsaridey@gmail.com';

-- Update the user to be admin (this bypasses RLS when run in SQL Editor)
UPDATE auth.users
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN '{"is_super_admin": true}'::jsonb
    ELSE jsonb_set(raw_app_meta_data, '{is_super_admin}', 'true'::jsonb, true)
  END
WHERE email = 'manikamalsaridey@gmail.com';

-- Verify the update worked
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'is_super_admin' as is_super_admin_check
FROM auth.users
WHERE email = 'manikamalsaridey@gmail.com';

-- You should see: is_super_admin_check: "true"

-- =====================================================
-- METHOD 2: Create a function with SECURITY DEFINER
-- This allows setting admin from code
-- =====================================================

CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
SET search_path = public
AS $$
BEGIN
  -- Update the user's app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{is_super_admin}',
    'true'::jsonb,
    true
  )
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

-- Grant execute to authenticated users (optional, for future use)
GRANT EXECUTE ON FUNCTION set_user_as_admin(TEXT) TO authenticated;

-- Use the function to set yourself as admin
SELECT set_user_as_admin('manikamalsaridey@gmail.com');

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

-- Check if it worked
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->'is_super_admin' as is_super_admin,
  (raw_app_meta_data->>'is_super_admin')::boolean as is_admin_boolean
FROM auth.users
WHERE email = 'manikamalsaridey@gmail.com';

-- Expected result:
-- is_super_admin: true
-- is_admin_boolean: t (true)

-- =====================================================
-- BONUS: Check what app_metadata looks like
-- =====================================================

SELECT 
  email,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users
WHERE email = 'manikamalsaridey@gmail.com';


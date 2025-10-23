-- =====================================================
-- ADMIN CHECK FUNCTION - Query is_super_admin from auth.users
-- =====================================================

-- Create a function to check if user is admin
-- This can query auth.users table which is not directly accessible from client
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to access auth.users
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Query the is_super_admin field from auth.users
  SELECT 
    COALESCE(raw_app_meta_data->>'is_super_admin', 'false')::boolean
  INTO is_admin
  FROM auth.users
  WHERE id = user_id;
  
  -- Return the result (false if user not found)
  RETURN COALESCE(is_admin, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;

-- Test the function (replace with your user ID)
SELECT is_user_admin('45f3f07f-5e9d-4deb-9698-f34f55065683'::UUID);

-- =====================================================
-- SET YOUR USER AS ADMIN
-- =====================================================

-- Update your user to be admin
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{is_super_admin}',
  'true'::jsonb
)
WHERE email = 'manikamalsaridey@gmail.com';

-- Verify
SELECT 
  id,
  email,
  raw_app_meta_data->>'is_super_admin' as is_super_admin,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'manikamalsaridey@gmail.com';


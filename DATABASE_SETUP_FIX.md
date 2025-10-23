# Database Setup Fix - Profiles Table Issue

## 🚨 Problem Identified

The login was hanging because the `profiles` table doesn't exist or is inaccessible in your Supabase database. The app was waiting indefinitely for a database query that would never complete.

## ✅ Immediate Fix Applied

### Code Changes:
1. **Added 5-second timeout to `getUserProfile`** - Prevents infinite hanging
2. **Added 3-second timeout to `checkIsAdmin`** - Prevents infinite hanging
3. **Graceful fallback** - App will work even without profiles table
4. **Better error logging** - Shows exactly where it fails

### Result:
- ✅ Login will now complete within 5 seconds max
- ✅ User will be logged in even if profiles table is missing
- ✅ App remains functional
- ⚠️ Profile features won't work until table is created

## 🔧 Permanent Fix: Create Profiles Table

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com
2. Navigate to your project: `bkghokiqtocpimgpvwko`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run This SQL Script

Copy and paste this entire script into the SQL Editor and click **RUN**:

```sql
-- =====================================================
-- JAANU BOUTIQUE - Profiles Table Setup
-- =====================================================

-- Drop existing table if you want to start fresh (OPTIONAL)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;

-- Create RLS Policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- =====================================================
-- Create profile for existing users
-- =====================================================

-- Insert profiles for any existing auth.users who don't have a profile yet
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  'customer' as role
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Verify Setup
-- =====================================================

-- Check if profiles were created
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles;

```

### Step 3: Verify the Setup

After running the script, you should see a table showing all user profiles. Look for your user with email `manikamalsaridey@gmail.com`.

### Step 4: Make Your User Admin (Optional)

If you want admin access, run this:

```sql
-- Set your user as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'manikamalsaridey@gmail.com';

-- Verify
SELECT email, role FROM profiles WHERE email = 'manikamalsaridey@gmail.com';
```

## 🧪 Testing After Setup

1. **Refresh your app** (hard refresh: Ctrl+Shift+R)
2. **Try logging in again**
3. **Check console** - should now show:
   ```
   getUserProfile: Query completed. Data: {...} Error: null
   Profile loaded: { email: "...", full_name: "...", role: "customer" }
   Is admin: false (or true if you set admin)
   Redirecting user to: /
   ```

## 🎯 Developer Best Practices Applied

### What I Did Wrong Initially:
- ❌ Assumed database table existed
- ❌ No timeout on database queries
- ❌ No error handling for missing tables
- ❌ App became unusable when DB was misconfigured

### What's Fixed Now:
- ✅ **Timeout protection** - Queries don't hang forever
- ✅ **Graceful degradation** - App works even without full setup
- ✅ **Better error messages** - Clear indication of what's wrong
- ✅ **Comprehensive logging** - Easy to debug issues
- ✅ **Setup documentation** - Clear instructions to fix
- ✅ **Fallback mechanisms** - User experience isn't broken

### Future-Proofing Pattern:

```typescript
// BEFORE (Bad - can hang forever):
const data = await database.query();

// AFTER (Good - has timeout and fallback):
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Timeout')), 5000);
});
const data = await Promise.race([
  database.query(),
  timeoutPromise
]).catch(error => {
  console.error('Query failed:', error);
  return null; // Fallback value
});
```

## 📊 Error Handling Strategy

1. **Network/Database Operations**:
   - Always have timeouts
   - Always have fallbacks
   - Never let the app hang

2. **External Dependencies**:
   - Assume they might fail
   - Provide graceful degradation
   - Log errors clearly

3. **User Experience**:
   - Show loading states
   - Show error messages
   - Keep app functional

## 🚀 Next Steps

1. ✅ Run the SQL script above in Supabase
2. ✅ Verify profiles table exists
3. ✅ Set your user as admin (optional)
4. ✅ Test login again
5. ✅ Check that redirect works

## 📝 Prevention Checklist for Future Features

When adding new database-dependent features:

- [ ] Does the query have a timeout?
- [ ] Is there error handling?
- [ ] Does the app work if the query fails?
- [ ] Are error messages helpful?
- [ ] Is there logging for debugging?
- [ ] Is the database setup documented?
- [ ] Have you tested with missing/incomplete data?

---

**After running the SQL script, your login should work perfectly!** 🎉


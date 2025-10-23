# 🚀 Apply Database Migration - URGENT

## ⚠️ **Critical: Run This NOW for Cross-Device Favorites Sync**

Your favorites will NOT sync across devices until you run this migration in Supabase!

---

## 📋 Step-by-Step Instructions

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### 2. Select Your Project
Click on **jaanuboutique** project (or your project name)

### 3. Open SQL Editor
- In the left sidebar, click **SQL Editor**
- Click **New Query**

### 4. Copy the Migration SQL
Open the file: `supabase/migrations/001_user_activities_schema.sql`

**OR** copy from below:

```sql
-- Just run the ENTIRE contents of supabase/migrations/001_user_activities_schema.sql file
```

### 5. Paste and Run
- Paste the ENTIRE SQL content into the SQL Editor
- Click **Run** button (bottom right)

### 6. Verify Success
You should see:
```
Success. No rows returned
```

### 7. Verify Tables Created
Run this query to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_carts', 'user_favorites', 'orders', 'search_history', 'order_status_history');
```

You should see all 5 tables!

---

## ✅ What This Migration Does

1. **Creates user_carts table** - Persistent cart across devices
2. **Creates user_favorites table** - Favorites sync (THIS IS WHAT YOU NEED!)
3. **Creates orders table** - Order history
4. **Creates search_history table** - Search tracking
5. **Creates order_status_history table** - Audit trail
6. **Sets up RLS policies** - Security (users only see their own data)
7. **Creates database functions** - Cart merge, order creation
8. **Creates indexes** - Fast queries

---

## 🧪 Test After Migration

### Test 1: Add Favorite on Laptop
1. Login to your site on laptop
2. Add a product to favorites
3. You should see success toast

### Test 2: Check on Mobile
1. Login to your site on mobile (same account)
2. Go to favorites/wishlist page
3. **You should see the favorite from laptop!** ✅

### Test 3: Add Favorite on Mobile
1. On mobile, add another product to favorites
2. Go back to laptop
3. Refresh the page
4. **Both favorites should appear!** ✅

---

## 🐛 Troubleshooting

### "Permission denied for table user_favorites"
**Solution:** RLS policies aren't created. Re-run the migration.

### "Table user_favorites does not exist"
**Solution:** Migration didn't run successfully. Check for SQL errors and run again.

### "Favorites still not syncing"
**Solution:** 
1. Make sure migration ran successfully
2. Check browser console for errors
3. Make sure you're logged in (not guest)
4. Try logout and login again

---

## 🔄 After Migration

Once migration is applied:
- ✅ Favorites will sync across ALL devices
- ✅ Cart will sync across ALL devices (when I finish Cart context update)
- ✅ Order history will work
- ✅ Search history will track
- ✅ Everything is secure with RLS

---

## 📞 Need Help?

If migration fails or favorites still don't sync:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Make sure you're using the same account on both devices
4. Try adding console.log to see what's happening

---

**⏰ This should take 2-3 minutes!**

**Do this NOW and your favorites will sync across laptop and mobile immediately!** 🎉


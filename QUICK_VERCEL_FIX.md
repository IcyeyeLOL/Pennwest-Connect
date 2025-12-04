# 🚨 Quick Fix: Vercel Environment Variable

Your frontend is trying to connect to `localhost:8000` instead of your Railway backend. Here's how to fix it in 2 minutes:

## ✅ Step-by-Step Fix

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Log in
3. Click on your project (should be "pennwest-connect" or similar)

### Step 2: Add Environment Variable
1. Click **"Settings"** tab (top navigation)
2. Click **"Environment Variables"** (left sidebar)
3. Click **"Add New"** button

### Step 3: Enter the Variable
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://pennwest-connect-production.up.railway.app`
  - ⚠️ **IMPORTANT:** Must start with `https://`
  - ⚠️ **IMPORTANT:** No trailing slash!
- **Environment:** Select **"Production"** (or "All Environments" to be safe)
4. Click **"Save"**

### Step 4: Redeploy
**Option A: Automatic (Recommended)**
- Just push any code change:
  ```bash
  git commit --allow-empty -m "Trigger redeploy"
  git push
  ```

**Option B: Manual Redeploy**
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

### Step 5: Wait and Test
1. Wait 1-2 minutes for deployment to finish
2. Visit your Vercel site
3. Try registering again
4. Should work! ✅

---

## ✅ Verification Checklist

After setting the variable, verify:

- [ ] Variable name is exactly: `NEXT_PUBLIC_API_URL` (case-sensitive!)
- [ ] Value starts with `https://` (not `http://`)
- [ ] Value has no trailing slash (not `https://...railway.app/`)
- [ ] Environment is set to "Production" (or "All Environments")
- [ ] Frontend has been redeployed after adding the variable

---

## 🎯 Correct Value

Your Railway backend URL is:
```
https://pennwest-connect-production.up.railway.app
```

So in Vercel, set:
```
NEXT_PUBLIC_API_URL=https://pennwest-connect-production.up.railway.app
```

---

## ⚠️ Common Mistakes

❌ **Wrong:**
- `NEXT_PUBLIC_API_URL=pennwest-connect-production.up.railway.app` (missing `https://`)
- `NEXT_PUBLIC_API_URL=http://pennwest-connect-production.up.railway.app` (should be `https://`)
- `NEXT_PUBLIC_API_URL=https://pennwest-connect-production.up.railway.app/` (trailing slash)

✅ **Correct:**
- `NEXT_PUBLIC_API_URL=https://pennwest-connect-production.up.railway.app`

---

## 🔍 How to Check if It's Set

After redeploying, you can verify in browser console:

1. Open your deployed site
2. Press `F12` → Console tab
3. Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Should show: `https://pennwest-connect-production.up.railway.app`

---

## 🆘 Still Not Working?

1. **Double-check the variable name** - Must be exactly `NEXT_PUBLIC_API_URL`
2. **Check if you redeployed** - Environment variables are baked in at build time
3. **Clear browser cache** - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. **Check Vercel build logs** - Make sure the build succeeded

---

## ✅ That's It!

Once you set `NEXT_PUBLIC_API_URL` correctly and redeploy, your frontend will connect to your Railway backend and registration will work!


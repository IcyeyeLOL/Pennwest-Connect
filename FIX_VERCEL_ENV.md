# 🔧 Fix: Missing NEXT_PUBLIC_API_URL in Vercel

## 🚨 The Problem

Your deployed frontend is trying to connect to `http://localhost:8000` instead of your actual backend URL. This happens because the `NEXT_PUBLIC_API_URL` environment variable is not set in Vercel.

## ✅ The Solution (5 minutes)

### Step 1: Get Your Backend URL

1. Go to your **Railway** (or Render) dashboard
2. Find your backend service
3. Copy the URL (e.g., `https://pennwest-connect-production.up.railway.app`)
   - Make sure it starts with `https://`
   - No trailing slash!

### Step 2: Set Environment Variable in Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Log in and select your project

2. **Navigate to Settings:**
   - Click on your project
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in the left sidebar

3. **Add the Variable:**
   - Click **"Add New"** button
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your backend URL (e.g., `https://your-app.railway.app`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

### Step 3: Redeploy

1. **Option A: Automatic (Recommended)**
   - Vercel will auto-redeploy when you push new code
   - Just push any change to trigger redeploy:
     ```bash
     git commit --allow-empty -m "Trigger redeploy"
     git push
     ```

2. **Option B: Manual Redeploy**
   - Go to Vercel dashboard
   - Click **"Deployments"** tab
   - Click the **"..."** menu on latest deployment
   - Click **"Redeploy"**

### Step 4: Verify

1. Wait for deployment to finish (1-2 minutes)
2. Visit your deployed frontend
3. Try to register/login
4. The error should be gone! ✅

---

## 📋 Quick Checklist

- [ ] Got backend URL from Railway/Render
- [ ] Added `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Set value to backend URL (with `https://`, no trailing slash)
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed frontend
- [ ] Tested registration/login - works! ✅

---

## 🎯 Example

**Backend URL (Railway):**
```
https://pennwest-connect.railway.app
```

**Vercel Environment Variable:**
```
Key: NEXT_PUBLIC_API_URL
Value: https://pennwest-connect.railway.app
```

**NOT:**
- ❌ `http://pennwest-connect.railway.app` (missing `s` in `https`)
- ❌ `https://pennwest-connect.railway.app/` (trailing slash)
- ❌ `pennwest-connect.railway.app` (missing `https://`)

---

## 🔍 How to Check if It's Set

After redeploying, you can verify:

1. **Check in Browser Console:**
   - Open your deployed site
   - Press F12 → Console tab
   - Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
   - Should show your backend URL

2. **Check Network Tab:**
   - Press F12 → Network tab
   - Try to register/login
   - Look at the failed request
   - The URL should now be your backend URL, not `localhost:8000`

---

## 🆘 Still Not Working?

1. **Double-check the URL:**
   - Visit your backend URL directly: `https://your-backend.railway.app/health`
   - Should return: `{"status": "healthy"}`

2. **Check CORS:**
   - Make sure `FRONTEND_URL` in Railway matches your Vercel URL
   - No trailing slashes!

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. **Check Vercel Logs:**
   - Vercel Dashboard → Your Project → Deployments → Click latest → Logs
   - Look for any errors

---

## 📝 Notes

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- They're baked into your app at build time
- You must redeploy after changing them
- The value must be the exact backend URL (no trailing slash, use `https://`)

---

## ✅ That's It!

Once you set `NEXT_PUBLIC_API_URL` in Vercel and redeploy, your frontend will connect to your backend correctly!


# 🔍 Information Needed to Fix Registration Error

I need the following information to help you fix the "Registration failed" error. Follow these steps to gather it:

---

## 📋 Step 1: Get Your Railway Backend URL

### How to Get It:

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Log in and select your project

2. **Find Your Service:**
   - Click on "Pennwest-Connect" service

3. **Get the URL:**
   - Click **"Settings"** tab
   - Scroll to **"Domains"** or **"Public Domain"** section
   - Copy the URL (should look like: `https://superb-respect-production.up.railway.app`)

4. **Test It:**
   - Open the URL in a new tab
   - Add `/health` at the end: `https://your-url.railway.app/health`
   - Should show: `{"status": "healthy"}`

**What to Send Me:**
```
Backend URL: https://your-url.railway.app
Health Check: [Working / Not Working]
```

---

## 📋 Step 2: Check Vercel Environment Variables

### How to Check:

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Log in and select your project

2. **Check Environment Variables:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar
   - Look for `NEXT_PUBLIC_API_URL`

3. **What to Check:**
   - ✅ Does `NEXT_PUBLIC_API_URL` exist?
   - ✅ What is its value? (Should match your Railway backend URL)
   - ✅ Is it set for "Production" environment?

**What to Send Me:**
```
NEXT_PUBLIC_API_URL: [Set / Not Set]
Value: https://your-backend-url.railway.app
Environment: [Production / Preview / Development / All]
```

---

## 📋 Step 3: Get Railway Backend Logs

### How to Get Logs:

1. **In Railway Dashboard:**
   - Click on "Pennwest-Connect" service
   - Click **"Logs"** tab (or "Deployments" → Latest deployment → "View Logs")

2. **Try to Register Again:**
   - Go back to your Vercel site
   - Try to register with the same info
   - Immediately go back to Railway logs

3. **Copy the Error:**
   - Look for any red error messages
   - Copy the last 10-20 lines of logs
   - Look for Python errors, database errors, or validation errors

**What to Send Me:**
```
[Paste the error logs here]
```

---

## 📋 Step 4: Check Railway Environment Variables

### How to Check:

1. **In Railway Dashboard:**
   - Click on "Pennwest-Connect" service
   - Click **"Variables"** tab

2. **Check These Variables:**
   - `SECRET_KEY` - Should be set (not the default)
   - `DATABASE_URL` - Should be a PostgreSQL connection string
   - `FRONTEND_URL` - Should be your Vercel URL
   - `STORAGE_TYPE` - Should be `cloudinary` or `s3`
   - If `STORAGE_TYPE=cloudinary`, check:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`

**What to Send Me:**
```
SECRET_KEY: [Set / Not Set]
DATABASE_URL: [Set / Not Set] (just confirm, don't share the actual value!)
FRONTEND_URL: [Set / Not Set] (what value?)
STORAGE_TYPE: [cloudinary / s3 / local / Not Set]
Cloudinary credentials: [All Set / Missing]
```

---

## 📋 Step 5: Get Browser Console Errors

### How to Get Console Errors:

1. **Open Your Vercel Site:**
   - Go to your registration page

2. **Open Developer Tools:**
   - Press `F12` (or right-click → Inspect)
   - Click **"Console"** tab
   - Click **"Network"** tab

3. **Try to Register:**
   - Fill in the form
   - Click "Create Account"
   - Watch the Console and Network tabs

4. **In Console Tab:**
   - Look for any red error messages
   - Copy any errors you see

5. **In Network Tab:**
   - Find the request to `/api/auth/register`
   - Click on it
   - Go to **"Response"** tab
   - Copy the response (should show the error from backend)

**What to Send Me:**
```
Console Errors: [Paste any errors here]
Network Response: [Paste the response from /api/auth/register]
```

---

## 📋 Step 6: Test Backend Directly

### How to Test:

1. **Open a new tab**
2. **Go to your Railway backend URL:**
   - `https://your-backend.railway.app/`
   - Should show: `{"message": "Pennwest Connect API", ...}`

3. **Test Registration Endpoint:**
   - Open a tool like [Postman](https://postman.com) or use browser console
   - Or use this command in a new terminal:
   ```bash
   curl -X POST https://your-backend.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@test.com","password":"test123"}'
   ```

**What to Send Me:**
```
Backend Root: [Working / Not Working]
Registration Endpoint: [Working / Not Working]
Error Message: [If any]
```

---

## 🎯 Quick Checklist

Copy this and fill it out:

```
=== DEBUGGING INFO ===

1. Railway Backend URL:
   URL: _______________________
   Health Check: [ ] Working [ ] Not Working

2. Vercel Environment Variables:
   NEXT_PUBLIC_API_URL: [ ] Set [ ] Not Set
   Value: _______________________

3. Railway Environment Variables:
   SECRET_KEY: [ ] Set [ ] Not Set
   DATABASE_URL: [ ] Set [ ] Not Set
   FRONTEND_URL: [ ] Set [ ] Not Set (Value: ___________)
   STORAGE_TYPE: [ ] cloudinary [ ] s3 [ ] local [ ] Not Set
   Cloudinary: [ ] All Set [ ] Missing

4. Railway Logs (when trying to register):
   [Paste error logs here]

5. Browser Console:
   [Paste console errors here]

6. Network Response:
   [Paste /api/auth/register response here]
```

---

## 🚀 Once You Have This Info

Send me:
1. The filled-out checklist above
2. Screenshots of:
   - Railway Variables tab
   - Vercel Environment Variables
   - Railway Logs (when error occurs)
   - Browser Console errors

With this information, I can pinpoint exactly what's wrong and fix it!

---

## 💡 Common Issues to Check First

Before gathering all the info, quickly check:

1. **Is `NEXT_PUBLIC_API_URL` set in Vercel?**
   - If not, that's likely the issue!

2. **Is `DATABASE_URL` set in Railway?**
   - Registration needs a database!

3. **Is `FRONTEND_URL` set in Railway?**
   - Should match your Vercel URL (for CORS)

4. **Check Railway logs immediately after trying to register**
   - The error will show there!


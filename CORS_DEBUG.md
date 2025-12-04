# 🔍 CORS Debugging Guide

## The Problem

Your Railway logs show:
```
OPTIONS /api/auth/register HTTP/1.1" 400 Bad Request
```

This means the CORS preflight request is failing. Here's how to fix it:

---

## ✅ Step 1: Verify FRONTEND_URL in Railway

1. **Go to Railway → Pennwest-Connect → Variables**
2. **Check `FRONTEND_URL`:**
   - Should be: `https://pennwest-connect-oc4f.vercel.app` (no trailing slash!)
   - NOT: `https://pennwest-connect-oc4f.vercel.app/` (with slash)

3. **If it has a trailing slash, fix it:**
   - Edit `FRONTEND_URL`
   - Remove the `/` at the end
   - Save (Railway will auto-redeploy)

---

## ✅ Step 2: Check Railway Logs

After Railway redeploys, check the logs. You should see:
```
INFO: CORS allowed origins: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://pennwest-connect-oc4f.vercel.app']
```

**If your Vercel URL is NOT in that list, CORS will fail!**

---

## ✅ Step 3: Verify Vercel Environment Variable

1. **Go to Vercel → Settings → Environment Variables**
2. **Check `NEXT_PUBLIC_API_URL`:**
   - Should be: `https://pennwest-connect-production.up.railway.app`
   - Must start with `https://`
   - No trailing slash

3. **If it's wrong, fix it and REDEPLOY**

---

## ✅ Step 4: Test CORS Directly

Open browser console on your Vercel site and run:

```javascript
fetch('https://pennwest-connect-production.up.railway.app/api/auth/register', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://pennwest-connect-oc4f.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
  }
}).then(r => console.log('CORS Status:', r.status, r.statusText))
```

**Expected:** Status 200 or 204
**If 400:** CORS is not configured correctly

---

## 🎯 Common Issues

### Issue 1: FRONTEND_URL Mismatch
- **Problem:** `FRONTEND_URL` in Railway doesn't match your actual Vercel URL
- **Fix:** Update `FRONTEND_URL` to exactly match your Vercel URL (no trailing slash)

### Issue 2: Server Not Restarted
- **Problem:** Changed `FRONTEND_URL` but server didn't restart
- **Fix:** Railway auto-restarts, but wait 1-2 minutes and check logs

### Issue 3: Multiple Vercel URLs
- **Problem:** Vercel gives you different URLs (preview, production)
- **Fix:** Add both to `FRONTEND_URLS` (comma-separated) in Railway:
  ```
  FRONTEND_URLS=https://pennwest-connect-oc4f.vercel.app,https://pennwest-connect-git-main-yourname.vercel.app
  ```

---

## 🔍 Debugging Checklist

- [ ] `FRONTEND_URL` in Railway matches your Vercel URL exactly (no trailing slash)
- [ ] Railway logs show your Vercel URL in "CORS allowed origins"
- [ ] `NEXT_PUBLIC_API_URL` in Vercel is set correctly (with `https://`)
- [ ] Vercel frontend has been redeployed after setting the variable
- [ ] Railway backend has been redeployed after fixing `FRONTEND_URL`
- [ ] Test OPTIONS request returns 200/204, not 400

---

## 🚀 After Fixing

1. Wait for Railway to redeploy (1-2 minutes)
2. Wait for Vercel to redeploy (1-2 minutes)
3. Clear browser cache (Ctrl+Shift+R)
4. Try registering again

The CORS error should be gone!


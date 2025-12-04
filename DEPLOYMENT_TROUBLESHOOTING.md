# Deployment Troubleshooting Guide

## Registration Failed Error - Quick Fixes

### Step 1: Check Browser Console
1. Open your deployed website
2. Press `F12` or right-click → Inspect
3. Go to the **Console** tab
4. Try registering again
5. Look for errors - they will tell you exactly what's wrong

### Step 2: Verify Environment Variables

#### Frontend (Vercel/Netlify)
**Required:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```
- Must start with `https://` (not `http://`)
- No trailing slash
- Must be your actual backend URL

**How to set in Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL`
3. Value: Your backend URL (e.g., `https://pennwest-connect-backend.railway.app`)
4. **Redeploy** after adding

#### Backend (Railway/Render)
**Required:**
```bash
FRONTEND_URL=https://your-frontend-url.vercel.app
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://... (auto-provided by Railway)
```

**How to set in Railway:**
1. Go to your backend service → Variables
2. Add `FRONTEND_URL` = Your frontend URL (e.g., `https://pennwest-connect.vercel.app`)
3. Add `SECRET_KEY` = Generate a random string
4. **Redeploy** after adding

### Step 3: Test Backend Directly

Test if your backend is accessible:
```bash
# Replace with your actual backend URL
curl https://your-backend.railway.app/health
```

Should return: `{"status":"healthy"}`

### Step 4: Check CORS Configuration

If you see CORS errors in console, the backend isn't allowing your frontend domain.

**Fix:**
1. Make sure `FRONTEND_URL` on backend matches your frontend URL **exactly**
2. No trailing slashes
3. Must include `https://`
4. Redeploy backend after changing

### Step 5: Common Error Messages

**"Cannot connect to backend server"**
- Frontend can't reach backend
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running (check Railway/Render dashboard)

**"CORS policy" error**
- Backend blocking frontend requests
- Set `FRONTEND_URL` on backend to your frontend domain
- Redeploy backend

**"Registration failed" (generic)**
- Check browser console for actual error
- Check backend logs (Railway/Render logs)
- Verify database connection (check `DATABASE_URL`)

**"Email already registered"**
- User already exists - try different email or login instead

**"Username already taken"**
- Username exists - try different username

### Step 6: Check Backend Logs

**Railway:**
1. Go to your backend service
2. Click "Deployments" → Latest deployment → "View Logs"
3. Look for errors when registration is attempted

**Render:**
1. Go to your backend service
2. Click "Logs" tab
3. Look for errors

### Step 7: Verify Database Connection

If backend logs show database errors:
1. Check `DATABASE_URL` is set correctly
2. Verify database is running (Railway auto-starts PostgreSQL)
3. Check database migrations ran successfully

## Quick Checklist

- [ ] `NEXT_PUBLIC_API_URL` set on frontend (Vercel)
- [ ] `FRONTEND_URL` set on backend (Railway)
- [ ] `SECRET_KEY` set on backend
- [ ] `DATABASE_URL` set on backend (auto on Railway)
- [ ] Both services redeployed after env var changes
- [ ] Backend health check returns `{"status":"healthy"}`
- [ ] No CORS errors in browser console
- [ ] Backend logs show no errors

## Still Not Working?

1. **Check browser console** - Most errors show there
2. **Check backend logs** - See what the backend receives
3. **Test backend directly** - Use curl or Postman to test `/api/auth/register`
4. **Verify URLs match** - Frontend URL in backend CORS must match exactly


# 🔧 Fix: Server Crashing on Railway

## The Problem

Your server starts successfully but shuts down after ~8 seconds. This is likely because:

1. **Railway provides a dynamic PORT** - The server needs to use Railway's `PORT` environment variable
2. **Database connection might be failing** - If `DATABASE_URL` isn't set correctly
3. **Process might be exiting** - Need to ensure the server stays alive

## ✅ What I Fixed

1. **Updated to use Railway's PORT:**
   - Now checks `PORT` environment variable first (Railway provides this)
   - Falls back to config `PORT` if not set

2. **Added better error handling:**
   - Database initialization errors are now logged
   - Server won't start if database fails

3. **Added DATABASE_PUBLIC_URL fallback:**
   - Railway sometimes provides `DATABASE_PUBLIC_URL` instead of `DATABASE_URL`
   - Code now checks both

## 🔍 Check Railway Logs

After redeploying, check the logs for:

1. **CORS origins logged:**
   ```
   INFO: CORS allowed origins: [...]
   ```
   This confirms the server is starting correctly.

2. **Database connection:**
   ```
   INFO: Database initialized
   ```
   If you see an error here, `DATABASE_URL` might be wrong.

3. **Server binding:**
   ```
   INFO: Starting server on 0.0.0.0:XXXX
   ```
   The port should match Railway's assigned port (not always 8000).

## 🎯 Next Steps

1. **Push the code changes** I just made
2. **Check Railway logs** after redeploy
3. **Verify the server stays running** (doesn't shut down after 8 seconds)

If it still crashes, check:
- Railway logs for any error messages
- Database connection string is correct
- All required environment variables are set

---

## ⚠️ Important: Railway Environment Variables

Make sure these are set in Railway:

- ✅ `DATABASE_URL` (or `DATABASE_PUBLIC_URL` will be used as fallback)
- ✅ `FRONTEND_URL` (for CORS)
- ✅ `SECRET_KEY`
- ✅ `STORAGE_TYPE=cloudinary`
- ✅ `CLOUDINARY_CLOUD_NAME` (not `CLOUDINARY_CLOUD_NAM`!)
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`

Railway automatically provides:
- `PORT` - The port your server should listen on


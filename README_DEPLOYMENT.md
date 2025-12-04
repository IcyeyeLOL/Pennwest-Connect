# 🚀 Global Deployment Guide

This guide will help you deploy Pennwest Connect globally with production-ready configuration.

## 📋 Quick Start

### 1. Database Setup (PostgreSQL)

**Option A: Railway (Recommended - Free)**
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string → Set as `DATABASE_URL`

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com)
2. Create project → Settings → Database
3. Copy connection string → Set as `DATABASE_URL`

**Format:** `postgresql://user:password@host:port/database`

### 2. File Storage Setup

**Option A: Cloudinary (Recommended - Easier!)**

1. **Sign up:** Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. **Get credentials:** Dashboard shows Cloud Name, API Key, API Secret
3. **Set Environment Variables:**
   ```
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

**Option B: AWS S3 (Alternative)**

1. **Create S3 Bucket:**
   - AWS Console → S3 → Create bucket
   - Enable public read (or use presigned URLs)
   - Note bucket name and region

2. **Create IAM User:**
   - IAM → Users → Create user
   - Attach S3 access policy
   - Generate access keys

3. **Set Environment Variables:**
   ```
   STORAGE_TYPE=s3
   S3_BUCKET_NAME=your-bucket-name
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=us-east-1
   ```

### 3. Backend Deployment (Railway)

1. **Connect Repository:**
   - Railway → New Project → Deploy from GitHub
   - Select your repository
   - Set root directory: `backend`

2. **Set Environment Variables:**
   ```
   SECRET_KEY=<generate-random-string>
   DATABASE_URL=<postgresql-connection-string>
   FRONTEND_URL=<your-frontend-url>
   # For Cloudinary (Recommended - Easier!)
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   
   # OR for AWS S3
   # STORAGE_TYPE=s3
   # S3_BUCKET_NAME=<your-bucket>
   # AWS_ACCESS_KEY_ID=<your-key>
   # AWS_SECRET_ACCESS_KEY=<your-secret>
   # AWS_REGION=us-east-1
   ```

3. **Deploy:**
   - Railway auto-deploys on push
   - Get backend URL: `https://your-app.railway.app`

### 4. Frontend Deployment (Vercel)

1. **Import Project:**
   - Vercel → New Project → Import Git Repository
   - Select your repository

2. **Set Environment Variable:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

3. **Deploy:**
   - Vercel auto-detects Next.js
   - Get frontend URL: `https://your-app.vercel.app`

4. **Update Backend CORS:**
   - Add Vercel URL to `FRONTEND_URL` in Railway
   - Redeploy backend

## 🔐 Generate SECRET_KEY

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or OpenSSL
openssl rand -hex 32
```

## 📊 Database Schema

The application automatically creates these tables:
- `users` - User accounts (email, username, password)
- `notes` - Uploaded notes (title, class, file_path, author)
- `likes` - Note likes (user_id, note_id)
- `comments` - Note comments (user_id, note_id, content)

**No manual migration needed** - Tables are created on first run.

## 🗂️ File Storage

### Local Storage (Development Only)
```
STORAGE_TYPE=local
UPLOAD_DIR=uploads
```

### Cloudinary Storage (Recommended - Production)
```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### S3 Storage (Alternative)
```
STORAGE_TYPE=s3
S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

## ✅ Post-Deployment Checklist

- [ ] PostgreSQL database connected
- [ ] S3 bucket configured and accessible
- [ ] SECRET_KEY set (random, secure)
- [ ] FRONTEND_URL matches deployed frontend
- [ ] NEXT_PUBLIC_API_URL points to backend
- [ ] CORS configured correctly
- [ ] Test user registration
- [ ] Test file upload
- [ ] Test file download
- [ ] Verify data persists across restarts

## 🐛 Common Issues

**Database Connection Failed:**
- Verify `DATABASE_URL` format
- Check database is accessible
- Ensure SSL is configured if required

**File Upload Fails:**
- Verify S3 credentials
- Check bucket permissions
- Ensure bucket exists

**CORS Errors:**
- Verify `FRONTEND_URL` matches deployed URL
- Check backend CORS configuration
- Ensure no trailing slashes

## 📝 Environment Variables Reference

### Backend (Railway)
```
SECRET_KEY=required
DATABASE_URL=required (PostgreSQL)
FRONTEND_URL=required
STORAGE_TYPE=local|s3
S3_BUCKET_NAME=required if STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=required if STORAGE_TYPE=s3
AWS_SECRET_ACCESS_KEY=required if STORAGE_TYPE=s3
AWS_REGION=optional (default: us-east-1)
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=required (backend URL)
```

## 🎉 Success!

Your app is now:
- ✅ Globally accessible
- ✅ Using shared PostgreSQL database
- ✅ Using cloud file storage (S3)
- ✅ Production-ready and scalable


# Environment Variables Checklist

Complete guide to all environment variables needed for global deployment.

## 🔴 REQUIRED - Backend (Railway/Render/etc.)

### 1. **SECRET_KEY** (CRITICAL - Must be set!)
```bash
SECRET_KEY=8s7vaDuBam8egSzqdOs07hz4eV6bdKoOJhlOXKR-bmU
```
**Generate one:**
```bash
# Python
python -c "8s7vaDuBam8egSzqdOs07hz4eV6bdKoOJhlOXKR-bmU"

# Or OpenSSL
openssl rand -hex 32
```
**⚠️ Never use the default value in production!**

### 2. **DATABASE_URL** (REQUIRED for production)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
**Get from:**
- Railway: Auto-provided when you add PostgreSQL
- Render: Copy from database dashboard
- Neon: Copy connection string from dashboard

### 3. **FRONTEND_URL** (REQUIRED for CORS)
```bash
FRONTEND_URL=https://pennwest-connect-production.up.railway.app
```
**Important:** 
- No trailing slash
- Must match your deployed frontend URL exactly
- Used for CORS (Cross-Origin Resource Sharing)

### 4. **STORAGE_TYPE** (REQUIRED)
```bash
STORAGE_TYPE=cloudinary
```
**Options:**
- `cloudinary` (Recommended - easier!)
- `s3` (AWS S3)
- `local` (Development only - files won't persist)

---

## 🟡 REQUIRED IF USING CLOUDINARY

If `STORAGE_TYPE=cloudinary`, you need:

```bash
CLOUDINARY_CLOUD_NAME=dq8nnkcqq
CLOUDINARY_API_KEY=753831885695595
CLOUDINARY_API_SECRET=*********************************
```

**Get from:** [cloudinary.com](https://cloudinary.com) dashboard

---

## 🟡 REQUIRED IF USING AWS S3

If `STORAGE_TYPE=s3`, you need:

```bash
S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

---

## 🔴 REQUIRED - Frontend (Vercel/Netlify/etc.)

### **NEXT_PUBLIC_API_URL** (REQUIRED)
```bash
NEXT_PUBLIC_API_URL=https://superb-respect.app
```
**Important:**
- Must start with `https://` (or `http://` for local)
- No trailing slash
- This is your backend API URL

---

## 🟢 OPTIONAL - Backend

### **FRONTEND_URLS** (Optional - Multiple frontends)
```bash
FRONTEND_URLS=https://app1.vercel.app,https://app2.vercel.app
```
Comma-separated list if you have multiple frontend deployments.

### **HOST** (Optional - Default: 0.0.0.0)
```bash
HOST=0.0.0.0
```
Usually don't need to set this - deployment platforms handle it.

### **PORT** (Optional - Default: 8000)
```bash
PORT=8000
```
Usually auto-set by deployment platform (Railway uses PORT env var).

### **UPLOAD_DIR** (Optional - Default: uploads)
```bash
UPLOAD_DIR=uploads
```
Only used for local storage. Ignored if using Cloudinary/S3.

---

## 📋 Quick Setup Checklist

### Backend Environment Variables:
- [ ] `SECRET_KEY` - Generate a random string
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `FRONTEND_URL` - Your frontend URL (no trailing slash)
- [ ] `STORAGE_TYPE` - Set to `cloudinary` or `s3`
- [ ] Cloudinary credentials (if using Cloudinary):
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] OR S3 credentials (if using S3):
  - [ ] `S3_BUCKET_NAME`
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION`

### Frontend Environment Variables:
- [ ] `NEXT_PUBLIC_API_URL` - Your backend URL (no trailing slash)

---

## 🎯 Example Configuration

### Backend (Railway):
```bash
SECRET_KEY=abc123xyz789randomsecretkey456
DATABASE_URL=postgresql://user:pass@host:5432/dbname
FRONTEND_URL=https://pennwest-connect-xuog.vercel.app/
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=dq8nnkcqq
CLOUDINARY_API_KEY=753831885695595
CLOUDINARY_API_SECRET=*********************************
```

### Frontend (Vercel):
```bash
NEXT_PUBLIC_API_URL=https://pennwest-connect-xuog.vercel.app/
```

---

## ⚠️ Common Mistakes

1. **Trailing slashes:** 
   - ❌ `FRONTEND_URL=https://app.vercel.app/`
   - ✅ `FRONTEND_URL=https://app.vercel.app`

2. **Wrong protocol:**
   - ❌ `NEXT_PUBLIC_API_URL=your-backend.railway.app`
   - ✅ `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

3. **Default SECRET_KEY:**
   - ❌ `SECRET_KEY=your-secret-key-change-in-production`
   - ✅ `SECRET_KEY=<generated-random-string>`

4. **Missing STORAGE_TYPE:**
   - ❌ Not setting `STORAGE_TYPE` (will use local storage)
   - ✅ `STORAGE_TYPE=cloudinary`

---

## 🔍 How to Verify

After deployment, check:

1. **Backend health:** Visit `https://your-backend.railway.app/health`
2. **CORS working:** Try logging in from frontend
3. **File upload:** Upload a note and verify it's stored in Cloudinary
4. **Database:** Check if users/notes persist after restart

---

## 📝 Notes

- All environment variables are case-sensitive
- No spaces around `=` sign
- Use quotes if values contain special characters
- Frontend variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Backend variables are server-side only (more secure)


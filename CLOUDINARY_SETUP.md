# Cloudinary Setup Guide (Easy Alternative to AWS S3)

Cloudinary is much easier to set up than AWS S3 and has a generous free tier!

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Complete the signup (no credit card required)

### Step 2: Get Your Credentials

After signing up, you'll see your dashboard with:
- **Cloud Name** (e.g., `dq8nnkcqq`)
- **API Key** (e.g., `753831885695595`)
- **API Secret** (e.g., `*********************************`)

### Step 3: Set Environment Variables

In your backend deployment (Railway, Render, etc.), set:

```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

That's it! No bucket creation, no IAM setup, no complex configuration.

## 📊 Free Tier Limits

- **25 GB storage**
- **25 GB bandwidth/month**
- **25 million transformations/month**

Perfect for a school platform!

## ✅ Advantages Over AWS S3

- ✅ **No credit card required**
- ✅ **No bucket setup needed**
- ✅ **No IAM configuration**
- ✅ **Automatic image optimization**
- ✅ **Built-in CDN**
- ✅ **Simple API**

## 🔄 Migration from Local Storage

If you're already using local storage, files will automatically use Cloudinary once you set the environment variables. No code changes needed!

## 🎯 That's It!

Your files will now be stored in Cloudinary and accessible globally. Much simpler than AWS!


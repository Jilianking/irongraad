# Fix Firebase Permissions Error

## 🔧 Quick Fix for "Missing or insufficient permissions"

The error occurs because Firebase environment variables are missing in Vercel.

### Steps to Fix:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your `irongraad` project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add these variables:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=irongraad-progress.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=irongraad-progress
REACT_APP_FIREBASE_STORAGE_BUCKET=irongraad-progress.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

3. **Get Firebase Config Values**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your `irongraad-progress` project
   - Go to **Project Settings** (gear icon)
   - Scroll to **"Your apps"** section
   - Click the web app (</>) icon
   - Copy the config values

4. **Redeploy**
   - After adding variables, Vercel will auto-redeploy
   - The Firebase error should be resolved

## 🎯 That's it!

Once you add these environment variables, your app will work properly in production. 
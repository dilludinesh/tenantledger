# Firebase Authentication Guide

This guide explains how to ensure Firebase Authentication works correctly in both development and production environments.

## Authentication Methods

This application uses two authentication methods:

1. **Popup Authentication** (Development): Used in local development for faster feedback
2. **Redirect Authentication** (Production): Used in production for better reliability

## Fixing Authentication Issues in Production

If authentication is not working in your deployed application, follow these steps:

### 1. Add Your Domain to Firebase Authorized Domains

The most common reason for authentication failures in production is that your domain is not authorized in Firebase.

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Scroll down to **Authorized domains**
5. Add your production domain (e.g., `your-app.vercel.app` or your custom domain)
6. Save the changes

### 2. Verify Environment Variables

Make sure all Firebase environment variables are correctly set in your deployment platform:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 3. Check for Console Errors

If you're still having issues:

1. Open your deployed site
2. Open browser developer tools (F12 or right-click → Inspect)
3. Check the console for any authentication errors
4. Look specifically for "unauthorized domain" errors

### 4. Clear Browser Cache and Cookies

Sometimes, old authentication data can cause issues:

1. Clear your browser cache and cookies
2. Try signing in again

## How Authentication Works in This App

- In development (localhost), the app uses `signInWithPopup` for a faster development experience
- In production, the app uses `signInWithRedirect` for better reliability across different browsers and environments
- The app automatically detects the environment and uses the appropriate method

## Troubleshooting

If you're still experiencing issues:

1. **Check Firebase Logs**: Go to Firebase Console → Authentication → Users to see if login attempts are being recorded
2. **Verify CORS Settings**: Make sure your Firebase project allows requests from your domain
3. **Check for Ad Blockers**: Some ad blockers can interfere with authentication
4. **Try Incognito Mode**: Test in an incognito/private browser window to rule out extension issues

## Need More Help?

If you're still having trouble, check the [Firebase Authentication documentation](https://firebase.google.com/docs/auth) or open an issue in the project repository.
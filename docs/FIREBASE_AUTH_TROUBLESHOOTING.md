# Firebase Authentication Troubleshooting Guide

## Common Authentication Errors and Solutions

### 1. Cross-Origin-Opener-Policy Errors

**Error Messages:**
- `Cross-Origin-Opener-Policy policy would block the window.closed call`
- `The message port closed before a response was received`

**Causes:**
- Restrictive COOP headers blocking Firebase Auth popups
- Security policies preventing popup communication

**Solutions:**
✅ **Fixed in next.config.js:**
- Changed `Cross-Origin-Opener-Policy` to `same-origin-allow-popups`
- Updated `X-Frame-Options` from `DENY` to `SAMEORIGIN`
- Enhanced CSP to allow Google Auth domains

### 2. Popup Blocked Errors

**Error Messages:**
- `auth/popup-blocked`
- `auth/popup-closed-by-user`

**Solutions:**
✅ **Implemented fallback strategy:**
- Try popup authentication first
- Fallback to redirect authentication on mobile or if popup fails
- Show user-friendly messages for blocked popups

### 3. Firebase Configuration Issues

**Error Messages:**
- `auth/auth-domain-config-required`
- `auth/unauthorized-domain`

**Solutions:**
1. **Verify Firebase Console Settings:**
   - Go to Firebase Console → Authentication → Settings
   - Add your domain to "Authorized domains"
   - For production: `your-domain.com`
   - For development: `localhost`

2. **Check Environment Variables:**
   ```bash
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   ```

### 4. Development vs Production Issues

**Development (localhost):**
- Usually works fine with default settings
- Popups are typically allowed

**Production (deployed):**
- May face COOP/CORS issues
- Popups might be blocked by browsers
- Need proper domain configuration

## Implementation Details

### Enhanced Authentication Flow

```typescript
// 1. Try popup authentication
try {
  await signInWithPopup(auth, provider);
} catch (popupError) {
  // 2. Fallback to redirect on mobile or popup failure
  if (isMobileOrPopupBlocked(popupError)) {
    await signInWithRedirect(auth, provider);
  }
}

// 3. Handle redirect result on page load
useEffect(() => {
  const result = await getRedirectResult(auth);
  if (result) {
    // User signed in via redirect
  }
}, []);
```

### Security Headers Configuration

```javascript
// next.config.js
headers: [
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups', // Allow Firebase popups
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN', // Allow same-origin frames
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "frame-src 'self' https://accounts.google.com",
      "child-src 'self' https://accounts.google.com",
      // ... other CSP rules
    ].join('; '),
  },
]
```

## Testing Authentication

### 1. Test Popup Authentication
```bash
# Open browser console and check for errors
# Try signing in - should work without COOP errors
```

### 2. Test Redirect Authentication
```bash
# Simulate mobile user agent or block popups
# Should fallback to redirect flow
```

### 3. Test Error Handling
```bash
# Try with invalid configuration
# Should show user-friendly error messages
```

## Firebase Console Configuration

### 1. Authentication Settings
- **Sign-in method**: Enable Google
- **Authorized domains**: Add your production domain
- **OAuth redirect domains**: Ensure your domain is listed

### 2. Project Settings
- **Public-facing name**: Set appropriate name
- **Support email**: Set valid email
- **Authorized domains**: Include all domains where auth will be used

## Browser Compatibility

### Supported Browsers
- ✅ Chrome (popup + redirect)
- ✅ Firefox (popup + redirect)
- ✅ Safari (redirect recommended)
- ✅ Edge (popup + redirect)
- ✅ Mobile browsers (redirect only)

### Known Issues
- **Safari**: May block popups more aggressively
- **Mobile**: Popups often blocked, redirect preferred
- **Incognito/Private**: May have additional restrictions

## Monitoring and Debugging

### 1. Console Errors
```javascript
// Check for these specific errors:
- "Cross-Origin-Opener-Policy"
- "auth/popup-blocked"
- "auth/unauthorized-domain"
```

### 2. Network Tab
```javascript
// Monitor requests to:
- accounts.google.com
- identitytoolkit.googleapis.com
- securetoken.googleapis.com
```

### 3. Firebase Auth Debug
```javascript
// Enable Firebase debug logging
import { getAuth, connectAuthEmulator } from 'firebase/auth';

if (process.env.NODE_ENV === 'development') {
  // Enable debug logging
  auth.settings.appVerificationDisabledForTesting = true;
}
```

## Production Deployment Checklist

- [ ] Domain added to Firebase authorized domains
- [ ] Environment variables properly set
- [ ] COOP headers configured correctly
- [ ] CSP allows Google Auth domains
- [ ] Redirect authentication tested
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Security logging enabled

## Support and Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Google Identity Platform](https://developers.google.com/identity)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [COOP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
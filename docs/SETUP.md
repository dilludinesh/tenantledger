# Tenant Ledger Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Google account for Firebase setup

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "tenant-ledger")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Google" provider
3. Add your domain to "Authorized domains" (e.g., `localhost`, your production domain)

### 3. Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll add security rules later)
3. Select a location close to your users

### 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon to add a web app
4. Register your app with a nickname
5. Copy the configuration object

### 5. Set Up Security Rules

In Firestore Database → Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own ledger entries
    match /artifacts/tenantledgerio/users/{userId}/ledgerEntries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tenant-ledger-next
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3012`

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

For other platforms (Netlify, Railway, etc.):
1. Build the application: `npm run build`
2. Set environment variables in your platform
3. Deploy the `.next` folder

## Security Checklist

- [ ] Firebase security rules are properly configured
- [ ] Environment variables are set correctly
- [ ] Authentication is working
- [ ] User data isolation is verified
- [ ] HTTPS is enabled in production
- [ ] Domain is added to Firebase authorized domains

## Troubleshooting

### Common Issues

**Authentication not working:**
- Check if Google provider is enabled in Firebase
- Verify authorized domains include your current domain
- Check browser console for errors

**Data not saving:**
- Verify Firestore security rules
- Check if user is properly authenticated
- Look for errors in browser console

**Build errors:**
- Ensure all environment variables are set
- Check for TypeScript errors: `npm run lint`
- Verify all dependencies are installed

### Getting Help

1. Check browser console for errors
2. Review Firebase console for authentication/database issues
3. Ensure all environment variables match your Firebase config
4. Verify security rules allow your operations

## Features Overview

- **Authentication**: Google OAuth via Firebase Auth
- **Data Storage**: Cloud Firestore with user isolation
- **Real-time Updates**: React Query for efficient data fetching
- **Responsive Design**: Works on desktop and mobile
- **Form Validation**: Client-side validation with error handling
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loaders for better UX

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── dashboard/      # Main dashboard
│   ├── login/         # Authentication
│   └── globals.css    # Global styles
├── components/        # Reusable components
├── context/          # React context providers
├── lib/             # Firebase configuration
├── services/        # API services
├── types/          # TypeScript definitions
└── utils/         # Utility functions
```
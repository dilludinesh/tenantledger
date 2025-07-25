# Tenant Ledger Architecture

This document outlines the architecture and design decisions for the Tenant Ledger application.

## System Overview

Tenant Ledger is a web application designed to help landlords and property managers track tenant-related financial transactions. The application follows a client-side rendered architecture using Next.js with Firebase as the backend service.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Browser ├─────►  Next.js App    ├─────►   Firebase      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Application Layers

### 1. Presentation Layer (UI)

- **Components** (`/src/components/`): Reusable UI components
- **App Router** (`/src/app/`): Next.js pages and layouts

### 2. Application Layer

- **Context** (`/src/context/`): React context providers for state management
- **Services** (`/src/services/`): Business logic and API integrations

### 3. Data Layer

- **Firebase** (`/src/lib/firebase.ts`): Firebase configuration and service initialization
- **Types** (`/src/types/`): TypeScript type definitions

## Authentication Flow

1. User navigates to login page
2. User clicks "Sign in with Google"
3. Firebase Authentication redirects to Google OAuth
4. User authenticates with Google
5. User is redirected back to the application
6. Firebase handles the OAuth token
7. Application receives authenticated user
8. User is redirected to dashboard

## Data Model

### Users

- Managed by Firebase Authentication
- Contains basic user information (email, name, profile picture)

### Ledger Entries

```typescript
interface LedgerEntry {
  id: string;            // Document ID
  tenant: string;        // Tenant name
  amount: number;        // Transaction amount
  category: string;      // Transaction category
  description: string;   // Transaction description
  date: Date;            // Transaction date
  userId: string;        // Owner's user ID
  createdAt: Date;       // Entry creation timestamp
  updatedAt: Date;       // Entry update timestamp
}
```

## Security Model

- **Authentication**: Firebase Authentication with Google OAuth
- **Authorization**: Firestore security rules ensure users can only access their own data
- **Data Isolation**: Each user's data is stored in a separate collection path

## Performance Considerations

- React Query for efficient data fetching and caching
- Client-side rendering for better user experience
- Firestore indexing for optimized queries

## Future Improvements

1. **Offline Support**: Implement service workers for offline functionality
2. **Multi-tenancy**: Enhanced support for managing multiple properties
3. **Reporting**: Advanced financial reporting and analytics
4. **Mobile App**: Native mobile application using React Native
5. **Notifications**: Email or push notifications for payment reminders

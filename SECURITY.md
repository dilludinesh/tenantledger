# Security Policy

## Overview

This document outlines the security measures implemented in the Tenant Ledger application.

## Security Features

### 1. Authentication & Authorization
- **Firebase Authentication** with Google OAuth
- **User session management** with automatic logout
- **Protected routes** requiring authentication
- **Rate limiting** on authentication attempts (5 attempts per 5 minutes)

### 2. Data Protection
- **User data isolation** - Each user can only access their own data
- **Firestore security rules** enforcing server-side access control
- **Input validation** and sanitization on all user inputs
- **SQL injection** and XSS attack prevention

### 3. Security Headers
- **Content Security Policy (CSP)** - Prevents XSS attacks
- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-Content-Type-Options: nosniff** - Prevents MIME sniffing
- **X-XSS-Protection** - Browser XSS protection
- **Strict-Transport-Security** - Enforces HTTPS
- **Referrer-Policy** - Controls referrer information

### 4. Input Validation
- **Comprehensive validation** for all form inputs
- **Length limits** to prevent buffer overflow
- **Type checking** with TypeScript
- **Malicious pattern detection** for SQL injection and XSS

### 5. Security Logging
- **Authentication events** logging
- **Data access** logging
- **Suspicious activity** detection
- **Rate limiting** violations tracking

## Firestore Security Rules

The application uses the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/tenantledgerio/users/{userId}/ledgerEntries/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && isValidLedgerEntry();
    }
  }
}
```

## Environment Variables

Sensitive configuration is stored in environment variables. The application follows security best practices by:

- Storing actual configuration values in `.env.local` which is excluded from version control
- Using Firebase configuration variables which are designed to be public (not secrets)
- Following the 12-factor app methodology for configuration management

## Security Best Practices

### For Developers
1. **Never commit** sensitive data to version control
2. **Always validate** user input on both client and server
3. **Use parameterized queries** to prevent SQL injection
4. **Sanitize output** to prevent XSS attacks
5. **Keep dependencies updated** to patch security vulnerabilities

### For Deployment
1. **Enable HTTPS** in production
2. **Set up proper Firestore security rules**
3. **Configure security headers** in your hosting provider
4. **Monitor security logs** for suspicious activity
5. **Regular security audits** and penetration testing

## Reporting Security Issues

If you discover a security vulnerability, please report it to:
- Email: security@tenantledger.com
- Create a private GitHub issue

Please do not disclose security vulnerabilities publicly until they have been addressed.

## Security Updates

This document is updated whenever new security measures are implemented. Last updated: $(date)

## Compliance

This application implements security measures in compliance with:
- OWASP Top 10 security risks
- Firebase security best practices
- Next.js security guidelines
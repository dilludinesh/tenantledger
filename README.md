# Tenant Ledger

A modern web application for managing tenant payments and financial records. Built with Next.js 15, Firebase, and featuring a beautiful glassmorphism UI design.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google accounts
- 💰 **Financial Tracking** - Record and manage tenant payments, rent, maintenance, and other expenses
- 📊 **Categorized Entries** - Organize transactions by category (Rent, Maintenance, Security Deposit, Utilities, Other)
- 👤 **User-Specific Data** - Each user's data is completely isolated and secure
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI/UX**: TailwindCSS, Glassmorphism design
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Firestore
- **State Management**: TanStack React Query
- **Testing**: Jest, ts-jest

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account and project

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/tenantledger.git
   cd tenantledger
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Fill in your Firebase configuration details in `.env.local`

4. Run the development server
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application

### Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Google provider
3. Create a Firestore database
4. Add your Firebase configuration to the environment variables

## Project Structure

```
/src
  /app             # Next.js app router components
  /components      # Reusable UI components
  /context         # React context providers
  /lib             # Core libraries and configurations
  /services        # API services
  /types           # TypeScript type definitions
  /utils           # Utility functions
```

## Deployment

This project is configured for deployment with Vercel:

```bash
npm run build
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ✨ **Modern UI** - Beautiful glassmorphism design with smooth animations
- ⚡ **Real-time Updates** - Powered by React Query for optimal performance

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Cloud Firestore
- **State Management**: TanStack React Query
- **UI Components**: Custom components with glassmorphism design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dilludinesh/tenantledger.git
cd tenant-ledger-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local` with your Firebase configuration

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3012](http://localhost:3012) in your browser.

### Automated Setup

You can also use the provided setup script to configure Firebase:

```bash
node setup-firebase.js
```

This script will prompt you for your Firebase configuration values and create the `.env.local` file automatically.

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google provider
3. Create a Firestore database
4. Add your domain to authorized domains in Authentication settings
5. Copy your Firebase config to the `.env.local` file

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Main dashboard pages and components
│   ├── login/            # Authentication pages
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
├── context/             # React context providers
├── lib/                # Utility libraries (Firebase config)
├── services/           # API services (Firestore operations)
├── types/             # TypeScript type definitions
└── utils/            # Utility functions

docs/                  # Documentation files
├── FIREBASE_AUTH_GUIDE.md  # Guide for Firebase authentication
└── SETUP.md               # Detailed setup instructions
```

## Usage

1. **Sign In**: Use your Google account to sign in
2. **Add Entries**: Fill out the form to add new financial entries
3. **View Records**: Browse all your entries in the table
4. **Categories**: Organize entries by type (Rent, Maintenance, etc.)
5. **Search & Filter**: Easily find specific transactions

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3012
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- CSS Modules for component styling
- Tailwind CSS for utility classes

## Security

- Firebase credentials are stored in environment variables
- User data is isolated per authenticated user
- All database operations are secured with Firebase rules
- Authentication required for all protected routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.
## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your Firebase environment variables in the Vercel dashboard
4. Deploy

For detailed instructions on fixing authentication in production, see [Firebase Authentication Guide](docs/FIREBASE_AUTH_GUIDE.md).

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Firebase Authentication Guide](docs/FIREBASE_AUTH_GUIDE.md) - Fixing authentication issues in production
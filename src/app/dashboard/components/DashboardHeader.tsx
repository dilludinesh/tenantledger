import React from 'react';
import { User } from 'firebase/auth';
import styles from '../glass.module.css';

interface DashboardHeaderProps {
  currentUser: User | null;
  demoUser: User | null;
  setShowSignOutConfirm: (show: boolean) => void;
  children?: React.ReactNode; // To allow passing EntryForm as children
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  demoUser,
  setShowSignOutConfirm,
  children,
}) => {
  return (
    <header className="mb-10">
      {/* Title Section */}
      <div className="text-center mb-10">
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight title-gradient"
          aria-label="Tenant Ledger Dashboard"
          style={{
            display: 'inline-block',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)',
            lineHeight: 'normal'
          }}
        >
          <span style={{ letterSpacing: '0.01em' }}>Tenant Ledger</span>
        </h1>
      </div>

      {/* User Info and Entry Form combined */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 mb-10 w-full">
        <div className={`${styles.glassCard} text-base w-full shadow-sm flex flex-col lg:flex-row items-stretch justify-between gap-6 p-6`} style={{ borderRadius: 20 }}>
          {currentUser && (
            <div className="flex flex-col gap-2 lg:min-w-[300px]">
              <span className="text-xs text-gray-400">Welcome</span>
              <span
                className="text-lg font-semibold"
                style={{
                  background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                {demoUser && <span className="text-xs text-blue-600 ml-1">(Demo)</span>}
              </span>
              {currentUser.email && (
                <span className="text-gray-500 text-xs truncate max-w-[200px] lg:max-w-[280px]">
                  {currentUser.email}
                </span>
              )}
              <span
                className="font-mono text-xs break-all"
                style={{
                  background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <span className="text-gray-400">UID: </span>
                <span className="font-medium">{currentUser.uid}</span>
              </span>
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="btn-signout flex items-center justify-center space-x-2 px-4 py-2 text-sm font-bold shadow-md mt-3 w-fit"
                aria-label="Sign out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
          <div className="flex-1 lg:ml-6">
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { User } from 'firebase/auth';
import styles from '../glass.module.css';

interface DashboardHeaderProps {
  currentUser: User | null;
  demoUser: User | null;
  setShowSignOutConfirm: (show: boolean) => void;
  children?: React.ReactNode; // To allow passing EntryForm as children
  showFilters: boolean;
  onToggleFilters: () => void;
  onExportCSV: () => void;
  filteredEntriesCount: number;
  totalEntriesCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  demoUser,
  setShowSignOutConfirm,
  children,
  showFilters,
  onToggleFilters,
  onExportCSV,
  filteredEntriesCount,
  totalEntriesCount,
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
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 mb-8 w-full">
        <div className={`${styles.glassCard} text-base w-full shadow-sm flex flex-col lg:flex-row items-stretch justify-between gap-0 p-4`} style={{ borderRadius: 20 }}>
          {/* User Info Section with attached divider */}
          {currentUser && (
            <div className="flex lg:w-[25%] lg:min-w-[250px]">
              <div className="flex flex-col gap-2 flex-1">
                {/* User Info */}
                <div className="mb-1">
                  <span className="text-xs text-gray-400 block">Welcome</span>
                  <span
                    className="text-lg font-semibold block"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, rgb(167, 41, 240) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                    {demoUser && <span className="text-xs text-blue-600 ml-1">(Demo)</span>}
                  </span>
                </div>

                {currentUser.email && (
                  <div className="text-gray-500 text-sm truncate">
                    {currentUser.email}
                  </div>
                )}

                {/* Always visible UID - inline */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">User ID:</span>
                  <span
                    className="font-mono text-xs break-all font-medium"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {currentUser.uid}
                  </span>
                </div>

                {/* Sign out button - previous style */}
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="btn-signout flex items-center justify-center space-x-2 px-4 py-2 text-sm font-bold shadow-md mt-6 w-fit"
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

              {/* Divider attached to user info */}
              <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent my-2 mr-8"></div>
            </div>
          )}

          {/* Entry Form Section */}
          <div className="flex-1 lg:w-[45%] mt-3 lg:mt-0 lg:ml-2 lg:mr-4">
            {children}
          </div>

          {/* Second divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-4 my-2"></div>

          {/* Action Buttons Section */}
          <div className="flex flex-col gap-3 lg:w-[25%] lg:min-w-[200px] mt-3 lg:mt-0 justify-center">

            <button
              onClick={onToggleFilters}
              className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-bold shadow-md rounded-full transition-all ${showFilters
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              style={{
                boxShadow: showFilters
                  ? '0 2px 8px 0 rgba(37, 99, 235, 0.10)'
                  : '0 2px 8px 0 rgba(148, 163, 184, 0.10)',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                if (!showFilters) {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'translateY(-2px) scale(1.03)';
                  target.style.boxShadow = '0 4px 16px 0 rgba(148, 163, 184, 0.18)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showFilters) {
                  const target = e.target as HTMLElement;
                  target.style.transform = 'none';
                  target.style.boxShadow = '0 2px 8px 0 rgba(148, 163, 184, 0.10)';
                }
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span>Filters {filteredEntriesCount !== totalEntriesCount && `(${filteredEntriesCount})`}</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-bold shadow-md rounded-full text-white transition-all"
              style={{
                background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 2px 8px 0 rgba(34, 197, 94, 0.10)',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.background = 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)';
                target.style.transform = 'translateY(-2px) scale(1.03)';
                target.style.boxShadow = '0 4px 16px 0 rgba(34, 197, 94, 0.18)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.background = 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
                target.style.transform = 'none';
                target.style.boxShadow = '0 2px 8px 0 rgba(34, 197, 94, 0.10)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

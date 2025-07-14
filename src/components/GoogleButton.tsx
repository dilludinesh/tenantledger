import React from 'react';

export default function GoogleButton({
  onClick,
  disabled,
  loading = false,
}: {
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-blue-600 hover:bg-blue-700 text-white text-base font-medium py-2.5 px-7 rounded-full inline-flex items-center whitespace-nowrap shadow-lg transition-all duration-200 hover:shadow-xl"
      style={{ borderRadius: '50px' }}
    >
      {loading ? (
        <svg className="animate-spin w-5 h-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.86 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.68-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.68 2.84c.86-2.6 3.28-4.53 6.14-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {loading ? 'Please wait...' : 'Sign in with Google'}
    </button>
  );
}

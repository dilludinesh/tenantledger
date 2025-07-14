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
      className="google-signin-btn inline-flex items-center whitespace-nowrap shadow-lg transition-all duration-200 hover:shadow-xl"
      style={{
        borderRadius: '50px',
        background: '#1a73e8', // Google blue
        color: '#fff',
        fontWeight: 600,
        fontSize: '1rem',
        padding: '0.7rem 2.2rem',
        minHeight: 44,
        minWidth: 220,
        boxShadow: '0 2px 8px 0 rgba(26,115,232,0.10)',
        letterSpacing: '0.01em',
        border: 'none',
        outline: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center bg-white rounded-full p-1 mr-2">
          <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center bg-white rounded-full mr-2" style={{ width: 28, height: 28 }}>
          {/* New Google G logo SVG */}
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path d="M44.5 20H24v8.5h11.7C34.9 33.7 30.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.5 29.6 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.5 29.6 2 24 2 15.3 2 7.9 7.8 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 44c5.2 0 10-1.8 13.6-4.9l-6.3-5.2C29.7 35.3 27 36.5 24 36.5c-6.1 0-11.3-4.1-13.1-9.6l-7 5.4C7.9 40.2 15.3 44 24 44z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C17.7 41.2 20.7 44 24 44c6.2 0 10.9-3.3 12.7-8.5 1.1-2.7 1.8-5.6 1.8-8.5 0-1.3-.1-2.7-.3-4z" fill="#1976D2"/>
            </g>
          </svg>
        </span>
      )}
      {loading ? 'Please wait...' : 'Sign in with Google'}
    </button>
  );
}

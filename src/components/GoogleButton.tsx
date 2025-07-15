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
      className="google-signin-btn flex items-center whitespace-nowrap shadow-lg transition-all duration-200 hover:shadow-xl"
      style={{
        borderRadius: '50px',
        background: '#1a73e8',
        color: '#fff',
        fontWeight: 600,
        fontSize: '1rem',
        padding: 0,
        minHeight: 44,
        minWidth: 220,
        boxShadow: '0 2px 8px 0 rgba(26,115,232,0.10)',
        letterSpacing: '0.01em',
        border: 'none',
        outline: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.7 : 1,
        overflow: 'hidden',
      }}
    >
      {/* Google logo flush left, blends with button curve */}
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        height: 44,
        width: 44,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        marginRight: 16,
        flexShrink: 0,
      }}>
        <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M24 9.5c3.7 0 6.3 1.6 7.7 2.9l5.7-5.7C34.1 3.6 29.5 1.5 24 1.5 13.1 1.5 4.1 10.5 4.1 21.5c0 11 9 20 19.9 20 9.7 0 17.7-6.9 19.3-16.1H24v-8.9h20.2c.2 1.1.3 2.2.3 3.5 0 12.1-8.6 21-20.5 21-11.4 0-20.5-9.1-20.5-20.5S12.6 1.5 24 1.5z" fill="#F9AB00"/>
            <path d="M6.7 14.2l6.6 4.8C15.7 15.7 19.5 13 24 13c3.7 0 6.3 1.6 7.7 2.9l5.7-5.7C34.1 3.6 29.5 1.5 24 1.5c-7.7 0-14.2 4.7-17.3 11.2z" fill="#EA4335"/>
            <path d="M24 44.5c5.1 0 9.7-1.7 13.1-4.6l-6.1-5c-2.1 1.5-4.8 2.4-7 2.4-6.1 0-11.2-4.1-13-9.5l-6.7 5.2C7.8 39.7 15.1 44.5 24 44.5z" fill="#34A853"/>
            <path d="M44.1 21.5c0-1.1-.1-2.2-.3-3.5H24v8.9h11.2c-.5 2.7-2.7 4.6-5.2 4.6-1.5 0-2.9-.5-4-1.4l-6.1 5c2.5 2.2 5.7 3.5 9.1 3.5 5.2 0 9.6-3.6 10.9-8.6 1-2.7 1.5-5.6 1.5-8.5z" fill="#4285F4"/>
          </g>
        </svg>
      </span>
      {loading ? 'Please wait...' : 'Sign in with Google'}
      {loading ? 'Please wait...' : 'Sign in with Google'}
    </button>
  );
}

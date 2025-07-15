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
      {loading ? 'Please wait...' : 'Sign in with Google'}
      {loading ? 'Please wait...' : 'Sign in with Google'}
    </button>
  );
}

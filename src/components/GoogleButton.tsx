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
      className="google-signin-btn flex items-center justify-center whitespace-nowrap shadow-lg transition-all duration-200 hover:shadow-xl"
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
      {/* Official Google G logo, flush left */}
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
        marginRight: 8,
        flexShrink: 0,
        border: 'none',
        boxShadow: 'none',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/GoogleLogo.svg" alt="Google logo" width={18} height={18} style={{ display: 'block', border: 'none', boxShadow: 'none', margin: 0, padding: 0 }} />
      </span>
      <span style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44 }}>
        {loading ? 'Please wait...' : 'Sign in with Google'}
      </span>
    </button>
  );
}

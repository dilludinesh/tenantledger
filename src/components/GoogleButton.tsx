import React, { ReactNode } from 'react';

interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children?: ReactNode;
}

export default function GoogleButton({
  loading = false,
  children,
  ...props
}: GoogleButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
        backgroundColor: '#fff',
        border: '1px solid #dadce0',
        borderRadius: '24px',
        cursor: 'pointer',
        minWidth: '240px',
        fontFamily: '"Google Sans", Roboto, arial, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
        color: '#3c4043',
      }}
    >
      {!loading && (
        <div style={{ marginRight: '12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
        </div>
      )}
      <span>{loading ? (children || 'Signing in...') : (children || 'Sign in with Google')}</span>
    </button>
  );
}

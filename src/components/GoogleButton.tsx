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
      className="google-signin-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '280px', // Responsive width with max limit
        height: '48px',
        backgroundColor: '#fff',
        border: '1px solid #dadce0',
        borderRadius: '24px', // Perfect capsule shape (half of height)
        color: '#3c4043',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        // Better mobile touch target
        minHeight: '48px',
        touchAction: 'manipulation',
        // Prevent text selection on mobile
        userSelect: 'none',
        WebkitUserSelect: 'none',
        // Better mobile tap highlighting
        WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
        fontFamily: '"Google Sans", Roboto, arial, sans-serif',
        fontSize: '15px',
        fontWeight: 500, // Medium font weight
        letterSpacing: '0.25px',
        outline: 'none',
        position: 'relative',
        textAlign: 'center',
        transition: 'background-color 0.218s ease',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        opacity: disabled || loading ? 0.6 : 1,
        boxShadow: 'none', // No shadow
      }}
      // Desktop hover effects
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
      // Touch and click effects for mobile
      onTouchStart={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#f1f3f4';
        }
      }}
      onTouchEnd={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#f1f3f4';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }
      }}
    >
      {/* Google G Logo */}
      <div
        style={{
          height: '20px',
          marginRight: '12px',
          minWidth: '20px',
          width: '20px',
        }}
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          style={{ display: 'block', height: '20px', width: '20px' }}
        >
          <path
            fill="#EA4335"
            d="m24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      </div>

      {/* Button Text */}
      <span style={{
        flexGrow: 1,
        fontFamily: '"Google Sans", Roboto, arial, sans-serif',
        fontSize: '15px',
        fontWeight: 500, // Medium font weight
        letterSpacing: '0.25px',
        color: '#3c4043',
        textAlign: 'center'
      }}>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  );
}

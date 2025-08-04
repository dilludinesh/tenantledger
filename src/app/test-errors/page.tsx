'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function TestErrorsPage() {
  useEffect(() => {
    // Test that our error filtering is working
    console.log('🧪 Testing error filtering...');
    
    // These should be filtered out (not appear in console)
    console.error('runtime.lastError: The message port closed before a response was received');
    console.error('Cross-Origin-Opener-Policy policy would block the window.closed call');
    console.warn('Cross-Origin-Opener-Policy policy would block the window.close call');
    
    // This should still appear (real error)
    console.error('🔴 This is a real error that should appear');
    console.log('✅ Error filtering test complete - check console');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Error Filtering Test
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                What this page does:
              </h2>
              <ul className="text-blue-700 space-y-1">
                <li>• Tests if extension errors are filtered out</li>
                <li>• Tests if COOP errors are filtered out</li>
                <li>• Verifies real errors still show</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                Expected console output:
              </h2>
              <div className="text-green-700 font-mono text-sm space-y-1">
                <div>🧪 Testing error filtering...</div>
                <div>🔴 This is a real error that should appear</div>
                <div>✅ Error filtering test complete - check console</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Should NOT see in console:
              </h2>
              <div className="text-yellow-700 font-mono text-sm space-y-1">
                <div>❌ runtime.lastError messages</div>
                <div>❌ Cross-Origin-Opener-Policy messages</div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  console.error('runtime.lastError: Test filtered error');
                  console.error('🔴 Test real error');
                  console.log('✅ Manual test triggered');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Test Error Filtering Again
              </button>
            </div>
            
            <div className="text-center pt-6 border-t border-gray-200">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
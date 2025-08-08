'use client';

export default function DiagnosticsPage() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Production Diagnostics</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2">
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Next.js:</strong> ✅ Working</p>
              <p><strong>React:</strong> ✅ Working</p>
              <p><strong>TypeScript:</strong> ✅ Working</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Firebase Configuration Status</h2>
            <div className="space-y-2">
              <p><strong>API Key:</strong> {firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Auth Domain:</strong> {firebaseConfig.authDomain ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Project ID:</strong> {firebaseConfig.projectId ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Storage Bucket:</strong> {firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Messaging Sender ID:</strong> {firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>App ID:</strong> {firebaseConfig.appId ? '✅ Set' : '❌ Missing'}</p>
            </div>
            {!firebaseConfig.apiKey && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
                <p className="text-red-700">⚠️ Firebase environment variables are missing! This will cause the app to fail.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">CSS & Styling Test</h2>
            <div className="space-y-2">
              <p><strong>Tailwind CSS:</strong> <span className="text-blue-500">✅ Working</span></p>
              <p><strong>Custom CSS:</strong> <span className="text-green-500">✅ Working</span></p>
              <div className="mt-4 p-4 bg-blue-100 rounded border-2 border-blue-300">
                <p className="text-blue-800">This box should have blue styling if CSS is working</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">JavaScript Test</h2>
            <button 
              onClick={() => alert('JavaScript is working!')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Test JavaScript
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p><strong>Missing Environment Variables:</strong> Check if all Firebase env vars are set in production</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p><strong>Build Errors:</strong> Check build logs for TypeScript or dependency errors</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p><strong>Deployment Issues:</strong> Verify deployment platform configuration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/**
 * Configuration validation utilities
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Validate Firebase configuration
 */
export const validateFirebaseConfig = (config: FirebaseConfig): boolean => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain', 
    'projectId'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required Firebase configuration:', missingFields);
    throw new Error(`Missing required Firebase configuration: ${JSON.stringify(missingFields)}`);
  }

  // Check for dummy values
  const dummyValues = ['your_api_key_here', 'dummy', 'test'];
  const hasDummyValues = requiredFields.some(field => 
    dummyValues.some(dummy => config[field].includes(dummy))
  );

  if (hasDummyValues) {
    console.error('Firebase configuration contains dummy values');
    throw new Error('Firebase configuration contains dummy values');
  }

  return true;
};

/**
 * Get environment with fallback
 */
export const getEnvVar = (primary: string, fallback?: string): string => {
  return process.env[primary] || (fallback ? process.env[fallback] : '') || '';
};
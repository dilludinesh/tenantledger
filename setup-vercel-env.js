#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Vercel Environment Variables Setup');
console.log('=====================================\n');

// Function to read .env.local file
function readEnvFile() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return;
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      
      if (key && value) {
        envVars[key.trim()] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env.local file:', error.message);
    return null;
  }
}

// Function to check if Vercel CLI is installed
function isVercelInstalled() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function setupVercelEnv() {
  const envVars = readEnvFile();
  
  if (!envVars) {
    console.error('❌ Could not read environment variables from .env.local');
    console.log('Please make sure the file exists and has the correct format.');
    rl.close();
    return;
  }
  
  const firebaseVars = Object.keys(envVars).filter(key => 
    key.startsWith('NEXT_PUBLIC_FIREBASE_')
  );
  
  if (firebaseVars.length === 0) {
    console.error('❌ No Firebase environment variables found in .env.local');
    rl.close();
    return;
  }
  
  console.log('Found the following Firebase environment variables:');
  firebaseVars.forEach(key => {
    // Mask the actual values for security
    const value = envVars[key];
    const maskedValue = value.length > 8 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : '********';
    console.log(`- ${key}: ${maskedValue}`);
  });
  
  console.log('\nOptions to add these to Vercel:');
  
  // Option 1: Vercel CLI
  console.log('\n1️⃣ Using Vercel CLI:');
  if (isVercelInstalled()) {
    console.log('✅ Vercel CLI is installed');
    console.log('\nRun these commands:');
    console.log('\nvercel login');
    
    firebaseVars.forEach(key => {
      console.log(`vercel env add ${key} production`);
    });
    
    console.log('\nvercel --prod');
  } else {
    console.log('❌ Vercel CLI not found');
    console.log('Install it with: npm install -g vercel');
  }
  
  // Option 2: Vercel Dashboard
  console.log('\n2️⃣ Using Vercel Dashboard:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add each variable:');
  
  firebaseVars.forEach(key => {
    console.log(`   - Name: ${key}`);
    console.log(`     Value: ${envVars[key]}`);
    console.log(`     Environment: Production`);
  });
  
  // Generate a .vercel-env file for easy copy-paste
  const vercelEnvContent = firebaseVars.map(key => `${key}=${envVars[key]}`).join('\n');
  fs.writeFileSync('.vercel-env', vercelEnvContent);
  
  console.log('\n✅ Created .vercel-env file with all variables for easy copy-paste');
  console.log('⚠️  Note: This file contains sensitive information. Delete it after use.');
  
  rl.close();
}

setupVercelEnv().catch(console.error);
// Load both .env and .env.local
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Checking environment variables from .env and .env.local...\n');

const variables = {
  // Firebase Web App Config (.env)
  'REACT_APP_FIREBASE_API_KEY': process.env.REACT_APP_FIREBASE_API_KEY,
  'REACT_APP_FIREBASE_AUTH_DOMAIN': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  'REACT_APP_FIREBASE_PROJECT_ID': process.env.REACT_APP_FIREBASE_PROJECT_ID,
  'REACT_APP_FIREBASE_STORAGE_BUCKET': process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID': process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  'REACT_APP_FIREBASE_APP_ID': process.env.REACT_APP_FIREBASE_APP_ID,
  
  // Notification Services (.env.local)
  'SENDGRID_KEY': process.env.SENDGRID_KEY,
  'TWILIO_SID': process.env.TWILIO_SID,
  'TWILIO_TOKEN': process.env.TWILIO_TOKEN,
  'TWILIO_FROM': process.env.TWILIO_FROM
};

console.log('Firebase Web App Configuration (.env):');
console.log('------------------------------------');
for (const [key, value] of Object.entries(variables)) {
  if (key.startsWith('REACT_APP')) {
    console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
  }
}

console.log('\nNotification Services Configuration (.env.local):');
console.log('----------------------------------------------');
for (const [key, value] of Object.entries(variables)) {
  if (!key.startsWith('REACT_APP')) {
    console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
    if (value) {
      console.log(`Length: ${value.length} characters`);
      if (key.includes('KEY') || key.includes('TOKEN') || key.includes('SID')) {
        console.log('Key is present (hidden for security)');
      }
    }
    console.log(''); // Empty line for readability
  }
} 
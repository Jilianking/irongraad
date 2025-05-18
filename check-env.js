// Load both .env and .env.local
require('dotenv').config(); // Primarily for REACT_APP_ variables from .env
require('dotenv').config({ path: '.env.local', override: true }); // For .env.local, potentially overriding .env for server vars

console.log('\n🔍 Checking environment variables...\n');

const clientSideFirebaseVars = {
  'REACT_APP_FIREBASE_API_KEY': process.env.REACT_APP_FIREBASE_API_KEY,
  'REACT_APP_FIREBASE_AUTH_DOMAIN': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  'REACT_APP_FIREBASE_PROJECT_ID': process.env.REACT_APP_FIREBASE_PROJECT_ID,
  'REACT_APP_FIREBASE_STORAGE_BUCKET': process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID': process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  'REACT_APP_FIREBASE_APP_ID': process.env.REACT_APP_FIREBASE_APP_ID,
};

const serverSideAdminFirebaseVars = {
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,       // For server.js Admin SDK
  'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,   // For server.js Admin SDK
  'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,      // For server.js Admin SDK
};

const serverSideMessagingVars = {
  'SENDGRID_KEY': process.env.SENDGRID_KEY,                   // For server.js SendGrid
  'TWILIO_SID': process.env.TWILIO_SID,                         // For server.js Twilio
  'TWILIO_TOKEN': process.env.TWILIO_TOKEN,                     // For server.js Twilio
  'TWILIO_FROM': process.env.TWILIO_FROM,                       // For server.js Twilio
};

console.log('Client-Side Firebase Configuration (expected in .env):');
console.log('-----------------------------------------------------');
for (const [key, value] of Object.entries(clientSideFirebaseVars)) {
  console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
}

console.log('\nServer-Side Firebase Admin Configuration (expected in .env.local or .env):');
console.log('-------------------------------------------------------------------------');
for (const [key, value] of Object.entries(serverSideAdminFirebaseVars)) {
  console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
  if (value && key.includes('KEY')) console.log(`   ${value.substring(0,30)}... (length: ${value.length})`);
  else if (value) console.log(`   Value: ${value}`);
}

console.log('\nServer-Side Messaging Configuration (expected in .env.local or .env):');
console.log('---------------------------------------------------------------------');
for (const [key, value] of Object.entries(serverSideMessagingVars)) {
  console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
  if (value && (key.includes('KEY') || key.includes('TOKEN') || key.includes('SID'))) console.log(`   Key is present (hidden for security, length: ${value.length})`);
  else if (value) console.log(`   Value: ${value}`);
} 
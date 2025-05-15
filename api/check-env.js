export default async function handler(req, res) {
  const envVars = {
    SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
  };

  res.status(200).json({
    message: 'Environment variables status',
    variables: envVars
  });
} 
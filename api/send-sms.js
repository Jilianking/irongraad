import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import twilio from 'twilio';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Send message via Twilio
    const message = await twilioClient.messages.create({
      body: text,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.VERCEL_URL}/api/twilio-webhook`
    });

    // Store message in Firebase
    const messageDoc = await db.collection('messages').add({
      from: 'admin@irongraad.com',
      to: to,
      text: text,
      twilioMessageId: message.sid,
      timestamp: new Date(),
      read: true,
      source: 'sms',
      status: message.status
    });

    return res.status(200).json({
      success: true,
      messageId: messageDoc.id,
      twilioMessageId: message.sid,
      status: message.status
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({
      error: 'Failed to send message',
      details: error.message
    });
  }
} 
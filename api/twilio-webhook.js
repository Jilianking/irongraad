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
    // Verify the request is coming from Twilio
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.VERCEL_URL + '/api/twilio-webhook';
    const params = req.body;

    const isValidRequest = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      params
    );

    if (!isValidRequest) {
      console.error('Invalid Twilio signature');
      return res.status(401).json({ error: 'Invalid Twilio signature' });
    }

    const { MessageSid, MessageStatus, From, To, Body } = req.body;

    // Handle message status updates
    if (MessageStatus) {
      await handleMessageStatus(MessageSid, MessageStatus);
      return res.status(200).send('<Response></Response>');
    }

    // Handle incoming messages
    if (From && To && Body) {
      await handleIncomingMessage(From, To, Body, MessageSid);
      return res.status(200).send('<Response></Response>');
    }

    return res.status(400).json({ error: 'Invalid webhook data' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleMessageStatus(messageId, status) {
  try {
    // Find the message in Firebase
    const messagesRef = db.collection('messages');
    const query = messagesRef.where('twilioMessageId', '==', messageId);
    const snapshot = await query.get();

    if (!snapshot.empty) {
      const messageDoc = snapshot.docs[0];
      await messageDoc.ref.update({
        status: status,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
}

async function handleIncomingMessage(from, to, text, messageId) {
  try {
    // Store the message in Firebase
    await db.collection('messages').add({
      from: from,
      to: 'admin@irongraad.com', // This will be used to identify incoming messages in the inbox
      text: text,
      twilioMessageId: messageId,
      timestamp: new Date(),
      read: false,
      source: 'sms',
      status: 'received'
    });
  } catch (error) {
    console.error('Error storing incoming message:', error);
    throw error;
  }
} 
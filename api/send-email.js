import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

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
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Send email via SendGrid
    const email = await sgMail.send({
      to: to,
      from: 'jilianmk70@gmail.com', // Using the verified sender email
      subject: subject,
      text: text,
    });

    // Store message in Firebase
    const messageDoc = await db.collection('messages').add({
      from: 'admin@irongraad.com',
      to: to,
      subject: subject,
      text: text,
      timestamp: new Date(),
      read: true,
      source: 'email',
      status: 'sent'
    });

    return res.status(200).json({
      success: true,
      messageId: messageDoc.id,
      status: 'sent'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
} 
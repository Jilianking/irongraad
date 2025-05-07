import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import admin from 'firebase-admin';
import serviceAccount from '../../firebaseAdmin.json'; // 🔐 Consider removing this in production

// 🔐 Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const firestore = admin.firestore();

// 🔑 Initialize APIs
sgMail.setApiKey(process.env.SENDGRID_KEY);
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export default async function handler(req, res) {
  // ✅ Handle CORS first
  const allowedOrigins = ['http://localhost:3000', 'https://irongraad.vercel.app'];
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : '*');
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // 🔁 Preflight ends here
  }

  // 🚫 Block all non-POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    name,
    email,
    phone,
    contactMethod,
    currentStep,
    trackingLinkId,
    isComplete,
    projectId
  } = req.body;

  const fullText = (isComplete
    ? `✅ Your project is now complete. Thank you!`
    : `📦 Your project has moved to the next step: "${currentStep}"`) +
    `\nTrack it here: https://irongraad.vercel.app/track/${trackingLinkId}`;

  const timestamp = new Date().toISOString();
  const logs = [];

  try {
    // ✅ Email
    if (contactMethod === 'email' || contactMethod === 'both') {
      await sgMail.send({
        to: email,
        from: 'jilianmk70@gmail.com',
        subject: isComplete ? 'Project Complete' : 'Project Update',
        text: fullText,
      });
      logs.push({ type: 'email', status: 'success', content: fullText, sentAt: timestamp });
      console.log("📧 Email sent.");
    }

    // ✅ SMS
    if (contactMethod === 'sms' || contactMethod === 'both') {
      const sms = await twilioClient.messages.create({
        body: fullText,
        from: process.env.TWILIO_FROM || '+18884891932',
        to: phone,
      });
      logs.push({ type: 'sms', status: 'success', content: fullText, sid: sms.sid, sentAt: timestamp });
      console.log("📲 SMS sent.");
    }

    // ✅ Firestore logs
    if (projectId) {
      const projectRef = firestore.collection('projects').doc(projectId);
      const messagesRef = projectRef.collection('messages');

      for (const log of logs) {
        await messagesRef.add(log);
        console.log("✅ Logged:", log);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Notification error:", err.message);

    // Log error to Firestore
    if (projectId) {
      await firestore.collection('projects').doc(projectId).collection('messages').add({
        type: contactMethod,
        status: 'error',
        error: err.message,
        sentAt: timestamp,
      });
    }

    return res.status(500).json({ error: err.message });
  }
}

// /api/sendNotification.js

import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

// Configure APIs using environment variables
sgMail.setApiKey(process.env.SENDGRID_KEY);
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export default async function handler(req, res) {
  // ✅ Allow CORS for local development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Respond to CORS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("🚀 /api/sendNotification HIT");

  if (req.method !== 'POST') {
    console.warn("⛔ Method not allowed:", req.method);
    return res.status(405).end('Method Not Allowed');
  }

  const { name, email, phone, currentStep, trackingLinkId, isComplete } = req.body;
  console.log("📨 Payload received:", { name, email, phone, currentStep, trackingLinkId, isComplete });

  const message = isComplete
    ? `✅ Your project is now complete. Thank you!`
    : `📦 Your project has moved to the next step: "${currentStep}"`;

  const fullText = `${message}\nTrack it here: https://irongraad.vercel.app/track/${trackingLinkId}`;

  try {
    // Send Email
    const emailResponse = await sgMail.send({
      to: email,
      from: 'jilianmk70@gmail.com', // Must be a verified sender in SendGrid
      subject: isComplete ? 'Project Complete' : 'Project Update',
      text: fullText,
    });
    console.log("📧 Email sent successfully.");

    // Send SMS
    const smsResponse = await twilioClient.messages.create({
      body: fullText,
      from: process.env.TWILIO_FROM || '+18884891932', // Fallback if env missing
      to: phone,
    });
    console.log("📲 SMS sent successfully:", smsResponse.sid);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error sending notification:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

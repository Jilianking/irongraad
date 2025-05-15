import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_KEY);

// Configure Twilio
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, currentStep, trackingLinkId, isComplete } = req.body;

    const message = isComplete
      ? `✅ Your project is now complete! Thank you for working with us.`
      : `📦 Your project has moved to: "${currentStep}"`;

    const fullText = `Hi ${name},\n\n${message}\n\nTrack your project here: https://irongraad.vercel.app/track/${trackingLinkId}`;

    // Send email if email is provided
    if (email) {
      await sgMail.send({
        to: email,
        from: 'jilianmk70@gmail.com', // Your verified sender
        subject: isComplete ? 'Project Complete!' : 'Project Update',
        text: fullText,
      });
      console.log('📧 Email sent successfully');
    }

    // Send SMS if phone is provided
    if (phone) {
      await twilioClient.messages.create({
        body: fullText,
        from: process.env.TWILIO_FROM || '+18884891932',
        to: phone,
      });
      console.log('📱 SMS sent successfully');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: error.message });
  }
} 
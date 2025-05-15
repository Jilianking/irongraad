const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with error handling
try {
  // Use the admin key file directly
  const adminKey = require('./firebaseAdmin.json');
  
  initializeApp({
    credential: cert(adminKey)
  });
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

const db = getFirestore();

// Initialize SendGrid and Twilio
sgMail.setApiKey(process.env.SENDGRID_KEY);
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
console.log('✅ SendGrid and Twilio initialized');

// Notification endpoint
app.post('/api/sendNotification', async (req, res) => {
  try {
    const { name, email, phone, currentStep, trackingLinkId, isComplete } = req.body;
    console.log('📨 Received notification request:', { name, email, phone, currentStep, isComplete });

    const message = isComplete
      ? `✅ Your project is now complete! Thank you for working with us.`
      : `📦 Your project has moved to: "${currentStep}"`;

    const fullText = `Hi ${name},\n\n${message}\n\nTrack your project here: https://irongraad.vercel.app/track/${trackingLinkId}`;

    // Send email if email is provided
    if (email) {
      await sgMail.send({
        to: email,
        from: 'jilianmk70@gmail.com',
        subject: isComplete ? 'Project Complete!' : 'Project Update',
        text: fullText,
      });
      console.log('📧 Email sent successfully to:', email);
    }

    // Send SMS if phone is provided
    if (phone) {
      await twilioClient.messages.create({
        body: fullText,
        from: process.env.TWILIO_FROM || '+18884891932',
        to: phone,
      });
      console.log('📱 SMS sent successfully to:', phone);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
});
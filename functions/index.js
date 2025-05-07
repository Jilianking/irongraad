const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

admin.initializeApp();
const db = admin.firestore();

// 🔐 Use Firebase config for secrets
sgMail.setApiKey(functions.config().sendgrid.key);
const twilioClient = twilio(
  functions.config().twilio.sid,
  functions.config().twilio.token
);

// 🔔 Callable function to send SMS + Email
exports.sendProjectUpdate = functions.https.onCall(async (data, context) => {
  const { name, email, phone, currentStep, trackingLinkId, isComplete } = data;

  const message = isComplete
    ? `✅ Your project is now complete!\nThank you for using Irongraad.`
    : `📦 Your project has moved to the next step: "${currentStep}".`;

  const link = `https://irongraad.vercel.app/track/${trackingLinkId}`;
  const fullMessage = `${message}\nTrack progress: ${link}`;

  try {
    // 📩 Send Email
    await sgMail.send({
      to: email,
      from: "your@email.com", // 🔁 Change this to your verified SendGrid sender
      subject: isComplete ? "Your Project is Complete!" : "Project Update",
      text: fullMessage,
    });

    // 📲 Send SMS
    await twilioClient.messages.create({
      body: fullMessage,
      from: "+YOUR_TWILIO_NUMBER", // 🔁 Replace with your Twilio number
      to: phone,
    });

    return { success: true };
  } catch (err) {
    console.error("❌ Notification error:", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});

const path = require("path");
const fs = require("fs");

// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let admin = null
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

// Initialize Firebase
try {
  admin = initializeApp(firebaseConfig)
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

/**
 * Sends a push notification to specific device tokens.
 * @param {string[]} tokens - Array of FCM registration tokens.
 * @param {object} payload - Notification payload { title, body, data }.
 */
const sendPush = async (tokens, payload) => {
  if (!admin.apps.length) {
    console.error("❌ Firebase not initialized. Cannot send push.");
    return { success: false, message: "Firebase not initialized" };
  }

  const validTokens = tokens.filter(t => !!t && t !== "MISSING");
  if (validTokens.length === 0) {
    console.warn("⚠️ No valid FCM tokens found for this push request.");
    return { success: false, message: "No valid tokens provided" };
  }

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
    tokens: validTokens,
  };

  console.log(`📡 Attempting to send push to ${validTokens.length} devices...`);

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Push Result: ${response.successCount} success, ${response.failureCount} failure`);

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Token [${validTokens[idx].substring(0, 10)}...] Failure:`, resp.error.message);
        }
      });
    }

    return { success: true, count: response.successCount };
  } catch (error) {
    console.error("❌ Critical Error sending push:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper to send notifications to all devices of a user.
 * @param {object} user - Mongoose user object with devices array.
 * @param {object} payload - { title, body, data }.
 */
const sendToUser = async (user, payload) => {
  if (!user.devices || user.devices.length === 0) return;
  const tokens = user.devices.map(d => d.pushToken).filter(t => !!t);
  if (tokens.length === 0) return;
  return await sendPush(tokens, payload);
};

module.exports = {
  sendPush,
  sendToUser
};

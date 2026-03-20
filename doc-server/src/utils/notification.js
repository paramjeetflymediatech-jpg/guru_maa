const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Check if Firebase service account file exists
const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin Initialized");
} else {
  console.warn("⚠️ Firebase service account file not found. Push notifications will be disabled.");
  console.warn("Please place your 'firebase-service-account.json' in the doc-server root directory.");
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
          console.error(`❌ Token [${validTokens[idx].substring(0,10)}...] Failure:`, resp.error.message);
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

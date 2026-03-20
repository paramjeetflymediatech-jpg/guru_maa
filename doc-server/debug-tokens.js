const mongoose = require("mongoose");
const User = require("./src/models/userModel");
const { MONGODB_URI } = require("./src/config/config");

async function checkTokens() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({ "devices.0": { $exists: true } });
    console.log(`Found ${users.length} users with devices.`);

    users.forEach(user => {
      console.log(`User: ${user.email}`);
      user.devices.forEach((dev, i) => {
        const tokenDisplay = dev.pushToken ? (dev.pushToken.length > 20 ? dev.pushToken.substring(0, 20) + "..." : dev.pushToken) : "MISSING";
        console.log(`  Device ${i+1}: ID=${dev.deviceId}, Type=${dev.deviceType}, Token=${tokenDisplay}`);
      });
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkTokens();

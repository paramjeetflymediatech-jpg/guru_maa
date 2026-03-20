const dotenv = require("dotenv");
dotenv.config();

const config = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key,
  client_email: process.env.client_email,
};

console.log("Config Check:");
console.log("Type:", config.type);
console.log("Project ID:", config.project_id);
console.log("Client Email:", config.client_email);
console.log("Private Key ID:", config.private_key_id);

if (config.private_key) {
  console.log("Private Key Start:", config.private_key.substring(0, 30));
  console.log("Private Key End:", config.private_key.substring(config.private_key.length - 30));
  console.log("Contains \\n (literal):", config.private_key.includes("\\n"));
  console.log("Contains \\n (newline):", config.private_key.includes("\n"));
  
  const processedKey = config.private_key.replace(/\\n/g, '\n');
  console.log("Processed Key Starts with PEM header:", processedKey.startsWith("-----BEGIN PRIVATE KEY-----"));
  console.log("Processed Key Ends with PEM footer:", processedKey.trim().endsWith("-----END PRIVATE KEY-----"));
} else {
  console.log("Private Key: MISSING");
}

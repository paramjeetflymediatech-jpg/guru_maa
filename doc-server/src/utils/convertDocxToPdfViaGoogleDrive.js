const { google } = require("googleapis");
const fs = require("fs-extra");
const KEYFILE = require("../google-service-account");
const path = require("path");

const key = KEYFILE.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
  credentials: { ...KEYFILE, private_key: key },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadDocToGoogleDrive(localPath) {
  console.log(localPath, "local----------------------l");
  const fileName = path.basename(localPath);
  console.log(fileName, "fileName----------------------l");
  const mimeType =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  // Upload file
  const file = await drive.files.create({
    requestBody: { name: fileName },
    media: { mimeType, body: fs.createReadStream(localPath) },
    fields: "id, webViewLink",
  });
  console.log(file, "file----------------------");

  return file.data; // { id, webViewLink }
}

async function convertDocxToPdfViaGoogleDrive(fileId, localPath) {
  const pdfPath = localPath.replace(/\.[^.]+$/, ".pdf");

  const res = await drive.files.export(
    { fileId, mimeType: "application/pdf" },
    { responseType: "stream" },
  );

  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(pdfPath);
    res.data.on("end", resolve).on("error", reject).pipe(dest);
  });

  return pdfPath;
}

module.exports = { convertDocxToPdfViaGoogleDrive, uploadDocToGoogleDrive };

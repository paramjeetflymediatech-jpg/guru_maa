const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const DOCS_ROOT = path.join(__dirname, "..", "..", "public", "docs");

// Ensure docs folder exists
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true }, // stored PDF
  originalName: { type: String }, // original DOC/DOCX name
  mimeType: { type: String },
  size: { type: Number },
  googleDriveFileId: { type: String }, // for editing
  googleDocLink: { type: String }, // admin edit link
  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", documentSchema);

/* ================= SERVICES ================= */

async function getAllDocuments() {
  return await Document.find().sort({ createdAt: -1 });
}

async function getPaginatedDocuments(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const docs = await Document.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Document.countDocuments();

  return {
    docs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalDocs: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function createDocument(fileData) {
  const doc = new Document(fileData);
  return await doc.save();
}

async function deleteDocument(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const doc = await Document.findById(id);
  if (!doc) return false;

  const fullPath = path.join(DOCS_ROOT, doc.filename);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  }

  await Document.findByIdAndDelete(id);
  return true;
}

async function getDocumentCount() {
  return await Document.countDocuments();
}

module.exports = {
  DOCS_ROOT,
  Document,
  getAllDocuments,
  getPaginatedDocuments,
  createDocument,
  deleteDocument,
  getDocumentCount,
};

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { BASE_URL } = require("../config/config");

const DOCS_ROOT = path.join(__dirname, "..", "..", "public", "docs");

// Ensure docs folder exists
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

// Mongoose Schema
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true }, // Stored on disk
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  folder: { type: String, default: null }, // For future folder categorization
  createdAt: { type: Date, default: Date.now },
});

// Virtual property for URL
documentSchema.virtual("url").get(function () {
  return `${BASE_URL}/docs/${this.filename}`;
});


const Document = mongoose.model("Document", documentSchema);

// Service functions (Wrappers)

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

  // Delete file from disk
  const fullPath = path.join(DOCS_ROOT, doc.filename);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("Failed to delete file from disk:", err);
    }
  }

  // Delete from DB
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

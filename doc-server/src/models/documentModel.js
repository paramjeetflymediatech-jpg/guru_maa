const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const DOCS_ROOT = path.join(__dirname, "..", "..", "public", "docs");
const baseurl = process.env.BASE_URL || "http://localhost:3000";
// Ensure docs folder exists
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, default: '' },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  // Category reference
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  // Content fields for text/HTML documents
  subtitle: { type: String },
  description: { type: String },
  author: { type: String },
  textContent: { type: String },
  htmlContent: { type: String },
  contentType: { type: String },
  // Metadata
  totalPages: { type: Number, default: 1 },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  readCount: { type: Number, default: 0 },
  // Google Drive integration
  googleDriveFileId: { type: String },
  googleDocLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", documentSchema);

// Category schema and model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: "📁" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", categorySchema);

/* ================= SERVICES ================= */

async function getAllDocuments() {
  return await Document.find().sort({ createdAt: -1 });
}

async function getDocumentsByCategory(categoryId) {
  return await Document.find({ category: categoryId }).sort({ createdAt: -1 });
}

async function getPaginatedDocuments(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const docs = await Document.find()
    .populate('category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Document.countDocuments();
  // Fix: use forEach instead of filter (filter returns new array, discarding mutations)
  docs.forEach((doc) => {
    if (!doc.url) {
      doc.url = `${baseurl}/docs/${doc.filename}`;
    }
  });

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

/* ================= CATEGORY SERVICES ================= */

async function getAllCategories() {
  return await Category.find().sort({ name: 1 });
}

async function getCategoryById(categoryId) {
  if (!categoryId) return null;
  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) return null;
    return await Category.findById(categoryId);
  } catch (err) {
    console.error("Error getting category:", err);
    return null;
  }
}

async function createCategory(categoryData) {
  const category = new Category(categoryData);
  return await category.save();
}

async function deleteCategory(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const category = await Category.findByIdAndDelete(id);
  return !!category;
}

async function updateCategory(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Category.findByIdAndUpdate(id, data, { new: true });
}

async function getPaginatedCategories(page = 1, limit = 9) {
  const skip = (page - 1) * limit;
  const categories = await Category.find()
    .sort({ order: 1, name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments();

  return {
    categories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalDocs: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Create text document
async function createTextDocument(docData) {
  const doc = new Document({
    title: docData.title,
    subtitle: docData.subtitle || '',
    description: docData.description || '',
    textContent: docData.textContent || '',
    author: docData.author || '',
    category: docData.category || null,
    totalPages: docData.totalPages || 1,
    isPublished: docData.isPublished !== undefined ? docData.isPublished : true,
    isFeatured: docData.isFeatured || false,
    contentType: 'text',
    filename: '',
    mimeType: 'text/plain',
    size: docData.textContent ? Buffer.byteLength(docData.textContent, 'utf8') : 0,
  });
  return await doc.save();
}

// Create HTML document
async function createHtmlDocument(docData) {
  const doc = new Document({
    title: docData.title,
    subtitle: docData.subtitle || '',
    description: docData.description || '',
    htmlContent: docData.textContent || '',
    author: docData.author || '',
    category: docData.category || null,
    totalPages: docData.totalPages || 1,
    isPublished: docData.isPublished !== undefined ? docData.isPublished : true,
    isFeatured: docData.isFeatured || false,
    contentType: 'html',
    filename: '',
    mimeType: 'text/html',
    size: docData.textContent ? Buffer.byteLength(docData.textContent, 'utf8') : 0,
  });
  return await doc.save();
}

// Search documents by title or description
async function searchDocuments(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const searchRegex = new RegExp(query.trim(), 'i');
  return await Document.find({
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { subtitle: searchRegex },
      { author: searchRegex },
    ]
  }).sort({ createdAt: -1 });
}

// Update document
async function updateDocument(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Document.findByIdAndUpdate(id, data, { new: true });
}

// Get document by ID
async function getDocumentById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Document.findById(id).populate('category');
}

/* ================= READING TRACKING ================= */

async function incrementReadingCount(docId) {
  if (!mongoose.Types.ObjectId.isValid(docId)) return false;
  try {
    await Document.findByIdAndUpdate(docId, { $inc: { readCount: 1 } });
    return true;
  } catch (err) {
    console.error("Error incrementing read count:", err);
    return false;
  }
}

module.exports = {
  DOCS_ROOT,
  Document,
  Category,
  getAllDocuments,
  getDocumentsByCategory,
  getPaginatedDocuments,
  getDocumentById,
  createDocument,
  deleteDocument,
  updateDocument,
  getDocumentCount,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getPaginatedCategories,
  createTextDocument,
  createHtmlDocument,
  searchDocuments,
  incrementReadingCount,
};

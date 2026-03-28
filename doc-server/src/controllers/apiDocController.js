// src/controllers/apiDocController.js
const { getAllDocuments, getAllCategories, getDocumentsByCategory, incrementReadingCount } = require("../models/documentModel");

// Check if a string contains HTML tags
function isHtmlContent(str) {
  if (!str || typeof str !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

function deriveTypeFromDoc(doc) {
  const mime = (doc.mimeType || "").toLowerCase();
  const name = (doc.originalName || doc.filename || "").toLowerCase();
  const contentType = doc.contentType;

  // If it's explicitly set as html content type, return html
  if (contentType === 'html') return 'html';

  // If it's text content type, check if the actual content contains HTML
  if (contentType === 'text') {
    if (isHtmlContent(doc.textContent) || isHtmlContent(doc.htmlContent)) {
      return 'html';
    }
    return 'text';
  }

  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";

  if (
    mime.includes("msword") ||
    mime.includes("officedocument.wordprocessingml") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return name.endsWith(".docx") ? "docx" : "doc";
  }

  // Fallback: check if any content field has HTML
  if (isHtmlContent(doc.textContent) || isHtmlContent(doc.htmlContent)) {
    return 'html';
  }

  return "text";
}

// Get category info for a document
async function getCategoryInfo(categoryId) {
  if (!categoryId) return null;
  const { getCategoryById } = require("../models/documentModel");
  return await getCategoryById(categoryId);
}

async function listDocs(req, res) {
  try {
    const { category } = req.query;

    let dbDocs;
    if (category) {
      dbDocs = await getDocumentsByCategory(category);
    } else {
      dbDocs = await getAllDocuments();
    }

    const docs = await Promise.all(dbDocs.map(async doc => {
      const json = doc.toJSON();
      const type = deriveTypeFromDoc(json);

      // Ensure filename is included for PDF type
      const filename = json.filename || '';
      json.contentType = json.contentType ? type : ''
      // Get category info
      let categoryInfo = null;
      if (json.category) {
        categoryInfo = await getCategoryInfo(json.category);
      }

      return {
        ...json,
        type,
        filename, // Explicitly include filename
        category: categoryInfo,
        // Return content based on derived type
        content: type === 'text'
          ? (json.textContent || '')
          : (type === 'html' ? (json.htmlContent || json.textContent || '') : null),
        // Default to 1 page if not specified
        totalPages: json.totalPages || 1,
      };
    }));

    return res.json({ docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// Get all categories
async function listCategories(req, res) {
  try {
    const categories = await getAllCategories();
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// Increment reading count when a document is opened
async function trackReading(req, res) {
  try {
    const { id } = req.params;
    await incrementReadingCount(id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { listDocs, listCategories, trackReading };

// src/controllers/apiDocController.js
const { getAllDocuments } = require("../models/documentModel");

function deriveTypeFromDoc(doc) {
  const mime = (doc.mimeType || "").toLowerCase();
  const name = (doc.originalName || doc.filename || "").toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";

  if (
    mime.includes("msword") ||
    mime.includes("officedocument.wordprocessingml") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return name.endsWith(".docx") ? "docx" : "doc";
  }

  // Fallback: treat as generic text/other
  return "text";
}

async function listDocs(req, res) {
  try {
    const dbDocs = await getAllDocuments();

    const docs = dbDocs.map(doc => {
      const json = doc.toJSON();
      const type = deriveTypeFromDoc(json);

      return {
        ...json,
        type,
        // Default to 1 page if not specified; can be extended later
        totalPages: json.totalPages || 1,
      };
    });

    return res.json({ docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { listDocs };

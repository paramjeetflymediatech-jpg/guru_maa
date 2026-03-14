// controllers/apiDocController.js
const path = require("path");
const { getAllDocuments, getAllCategories, getDocumentsByCategory } = require("../models/documentModel");

// This controller is not currently used but contains the API upload logic
// It requires authentication middleware to be added to the route
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Only allow PDF files for API upload
    if (ext !== ".pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed. Please upload a PDF file." });
    }
    
    const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const { title, subtitle, totalPages } = req.body;

    const doc = await getAllDocuments().then(docs => {
      // Create a simple document object (not saved to DB - needs proper implementation)
      return {
        title,
        subtitle,
        type: req.file.mimetype,
        totalPages: totalPages || 1,
        url: `uploads/documents/${randomName}`,
      };
    });

    res.json({
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("Upload doc error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
